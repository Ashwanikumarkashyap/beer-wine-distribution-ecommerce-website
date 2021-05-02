from flask import Flask, session, g, render_template, request, make_response, redirect
import pymongo
import urllib.parse
from bson.json_util import dumps
from bson.objectid import ObjectId
import math
import json
import bcrypt
import datetime
import re
# import phonenumbers
import os
from password_strength import PasswordPolicy
from werkzeug.utils import secure_filename
from flask import jsonify

app = Flask(__name__)

username = urllib.parse.quote("admin")
password = urllib.parse.quote("admin")

# url = mongodb+srv://<username>:<password>
url = "mongodb+srv://" + username + ":" + password + "@cluster0.riul3.mongodb.net/beer_wine_website?retryWrites=true&w=majority"
cluster = pymongo.MongoClient(url)
db = cluster["beer_wine_website"]

ALLOWED_EXTENSIONS = set(['png', 'jpg', 'jpeg'])
UPLOAD_DEST = 'static/prod_images/'

app.secret_key = 'my secret key'


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


# PAGE RENDERS

@app.route("/")
def main():
    is_logged_in = False
    if session.get('user'):
        is_logged_in = True
    return render_template('index.html', is_logged_in=is_logged_in)


@app.route("/login")
def login_signup():
    if session.get('user') is None:
        is_logged_in = False
        return render_template('login.html', is_logged_in=is_logged_in)
    else:
        return redirect("/")


@app.route("/account")
def account():
    if session.get('user'):
        is_logged_in = True
        return render_template('my-account.html', is_logged_in=is_logged_in)
    else:
        return redirect("/login")


@app.route("/logout")
def logout():
    if session.get('user'):
        session.pop('user', None)

    return redirect("/")


@app.route("/admin")
def admin():
    if session.get('user'):
        is_logged_in = True
        return render_template('admin.html', is_logged_in=is_logged_in)
    else:
        return redirect("/login")


@app.route("/products")
def products():
    is_logged_in = False
    if session.get('user'):
        is_logged_in = True
    return render_template('product-list.html', is_logged_in=is_logged_in)


@app.route("/cart")
def cart():
    if session.get('user'):
        is_logged_in = True
        return render_template('cart.html', is_logged_in=is_logged_in)
    else:
        return redirect("/login")


@app.route("/checkout")
def checkout():
    if session.get('user'):
        is_logged_in = True
        return render_template('checkout.html', is_logged_in=is_logged_in)
    else:
        return redirect("/login")


@app.route("/get_search_page/<search_query>", methods=["GET"])
def get_search_page(search_query):
    is_logged_in = False
    if session.get('user'):
        is_logged_in = True
    return render_template('product-list.html', is_logged_in=is_logged_in, search_query=search_query)


# @app.route("/login")
# def sign_up():
#     is_logged_in = False
#     if session.get('user'):
#         is_logged_in = True
#     return render_template('login.html', is_logged_in=is_logged_in)

# @app.route("/sign_in")
# def sign_in():
#     return render_template('signin.html')

# POST FUNCTIONS


# completed
@app.route("/val_sign_up", methods=["POST"])
def val_sign_up():
    request_json = request.json

    user_name = request_json["user_name"].lower()
    full_name = request_json["full_name"]
    email_id = request_json["email_id"]
    password = request_json["password"]
    contact_no = request_json["contact_no"]
    govt_id = request_json["govt_id"]

    collection = db["customer_details"]

    if collection.find_one({"user_name": user_name}):
        return json.dumps({"status": "failed", "message": "Username already exists."}), 409
    if collection.find_one({"email_id": email_id}):
        return json.dumps({"status": "failed", "message": "Email address already exists."}), 409
    # if collection.find_one({"contact_no": contact_no}):
    #     return json.dumps({"status": "failed", "message": "contact no already exists"})
    # if collection.find_one({"govt_id": govt_id}):
    #     return json.dumps({"status": "failed", "message": "govt_id already exists"})

    # email address validation
    email_regex = r"^(\w|\.|\_|\-)+[@](\w|\_|\-|\.)+[.]\w{2,3}$"
    if not re.search(email_regex, email_id):
        return jsonify({"status": "failed", "message": "invalid email address"}), 406

    # password validation
    # policy = PasswordPolicy.from_names(
    #     length=8,  # min length: 8
    #     uppercase=2,  # need min. 2 uppercase letters
    #     numbers=2,  # need min. 2 digits
    #     special=2,  # need min. 2 special characters
    #     nonletters=2,  # need min. 2 non-letter characters (digits, specials, anything)
    # )
    policy = PasswordPolicy.from_names(
        length=8,  # min length: 8
        uppercase=1,  # need min. 1 uppercase letters
        numbers=1,  # need min. 1 digits
        special=1,  # need min. 2 special characters
    )

    if len(policy.test(password)) > 0:
        return jsonify({"status": "failed", "message": "password not strong enough"}), 406

    # # phone number validation
    # ph_number = phonenumbers.parse(str(contact_no), "US")
    # if not phonenumbers.is_valid_number(ph_number):
    #     return jsonify({"status": "failed", "message": "invalid phone number"}), 406

    try:
        user_id = collection.insert_one({
            "user_name": user_name,
            "full_name": full_name,
            "email_id": email_id,
            "password": bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()),
            "shipping_address": {},
            "contact_no": contact_no,
            "govt_id": govt_id,
            "isAdmin": False
        }).inserted_id
        # res.set_cookie(
        #     "data",
        #     max_age=3600,
        #     expires=None,
        #     path=request.path,
        #     domain=None,
        #     secure=False
        # )
        session['user'] = {'user_name': user_name, 'user_id': str(user_id), 'is_admin': False}
        return json.dumps({"status": "success"}), 200
    except Exception as e:
        print("error in signup: ", e)
        return json.dumps({"status": "failed"}), 500



# completed
@app.route("/val_sign_in", methods=["POST"])
def val_sign_in():
    request_json = request.json

    user_name = request_json["user_name"].lower()
    password = request_json["password"]

    is_admin = request_json["is_admin"]

    # user_name = request.args.get("user_name")
    # password = request.args.get("password")

    collection = db["customer_details"]

    if collection.find_one({"user_name": user_name}) is None :
        return json.dumps({"status": "failed", "message": "Username does not exists"}), 406

    if is_admin:
        db_check = collection.find_one({"user_name": user_name, "isAdmin": is_admin})
    else:
        db_check = collection.find_one({"user_name": user_name})

    if db_check is None:
        return json.dumps({"status": "failed", "message": "Unauthorized access"}), 406

    if db_check and bcrypt.checkpw(password.encode("utf-8"), db_check["password"]):
        res = make_response(json.dumps({
            "status": "success",
        }))

        session['user'] = {'user_name': user_name, 'user_id': str(db_check['_id']), 'is_admin': is_admin}
        return res, 200
    else:
        return json.dumps({"status": "failed", "message": "Invalid login credentials"}), 406


@app.route("/add_shipping_address", methods=["POST", "GET"])
def add_shipping_address():
    request_json = request.json

    customer_id = session.get('user')['user_id']

    first_name = request_json["first_name"]
    last_name = request_json["last_name"]
    email = request_json["email"]
    phone = request_json["phone"]
    address = request_json["address"]
    city = request_json["city"]
    state = request_json["state"]
    zip_code = request_json["zip_code"]
    country = request_json["country"]


    collection = db["customer_details"]

    try:
        collection.update_one({'_id': ObjectId(customer_id)}, {'$set': {'shipping_address':
                                                                            {'first_name': first_name, 'last_name': last_name, 'email': email, 'phone': phone,
                                                                             'address': address, 'city': city, 'state': state, 'zip_code': zip_code, 'country': country}}})
    except Exception as e:
        return json.dumps({"status": "failed"}), 500

    return json.dumps({"status": "success"}), 200


@app.route("/get_shipping_address", methods=["GET"])
def get_shipping_address():

    customer_id = session.get('user')['user_id']
    collection = db["customer_details"]

    shipping_address = collection.find_one({"_id": ObjectId(customer_id)})["shipping_address"]

    return json.dumps({"status": "success", "result": shipping_address}), 200


# completed
@app.route("/add_to_products", methods=["POST"])
def add_to_products():
    user = session.get('user')

    if user and user['is_admin']:
        # request_json = request.json
        #
        # name = request_json["name"]
        # brand = request_json["brand"]
        # description = request_json["description"]
        # stock = request_json["stock"]
        # category = request_json["category"]
        # price = request_json["price"]
        # images = request_json["images"]

        files = request.files.getlist('files[]')
        name = request.form["name"]
        brand = request.form["brand"]
        description = request.form["description"]
        stock = request.form["stock"]
        category = request.form["category"].lower()
        price = request.form["price"]

        # name = request.args.get("name")
        # brand = request.args.get("brand")
        # description = request.args.get("description")
        # stock = request.args.get("stock")
        # category = request.args.get("category")
        # price = request.args.get("price")
        # images = request.args.getlist("images")
        deleted = False

        collection = db["product_details"]

        try:
            prod_id = collection.insert_one({
                "name": name,
                "brand": brand,
                "description": description,
                "stock": int(stock),
                "category": category,
                "price": float(price),
                "deleted": deleted,
                "images": [],
            }).inserted_id

            images = []
            for file in files:
                if file and allowed_file(file.filename):
                    filepath = UPLOAD_DEST + str(prod_id) + '-' + secure_filename(file.filename)
                    images.append('../' + filepath)
                    file.save(filepath)

            collection.update_one({"_id": ObjectId(prod_id)}, {"$set": {"images": images}})

            return json.dumps({"status": "success"}), 200
        except:
            return json.dumps({"status": "failed"}), 500
    return json.dumps({"status": "failed"}), 403


# POST/PUT FUNCTIONS

#
# # completed
# @app.route("/add_to_wishlist", methods=["POST", "PUT"])
# def add_to_wishlist():
#
#     customer_id = request.args.get("customer_id")
#     product_id = request.args.get("product_id")
#
#     collection = db["wishlist"]
#
#     db_check = collection.find_one({"customer_id": customer_id})
#
#     try:
#
#         if db_check:
#             collection.update_one({"customer_id": customer_id},
#             {"$set": {"product_ids": list(set(db_check["product_ids"] + [product_id]))}})
#         else:
#             collection.insert_one({
#                 "customer_id": customer_id,
#                 "product_ids": [product_id]
#             })
#
#         return json.dumps({"status": "success"}), 200
#
#     except:
#         return json.dumps({"status": "failed"}), 500


# completed
@app.route("/add_to_cart", methods=["POST"])
def add_to_cart():
    user = session.get('user')

    if user:
        request_json = request.json

        customer_id = user['user_id']
        product_id = request_json["product_id"]
        quantity = request_json["quantity"]

        # customer_id = request.args.get("customer_id")
        # product_id = request.args.get("product_id")
        # quantity = request.args.get("quantity")

        collection = db["cart"]

        db_check = collection.find_one({"customer_id": customer_id})

        if db_check:
            updated_product_details, product_id_found, old_quantity = [], False, None
            for product_data in db_check["product_ids"]:
                if product_data["product_id"] == product_id:
                    product_id_found = True
                    old_quantity = product_data["quantity"]
                    updated_product_details.append(
                        {"product_id": product_id, "quantity": int(quantity) + int(old_quantity)})
                else:
                    updated_product_details.append(product_data)
        else:
            collection.insert_one({
                "customer_id": customer_id,
                "product_ids": [{"product_id": product_id, "quantity": int(quantity)}],
                "total_price": float(db["product_details"].find_one({"_id": ObjectId(product_id)})["price"]) * float(
                    quantity)
            })
            return json.dumps({"status": "success", "message": "new cart created for customer and product added"}), 200

        if product_id_found:
            price_change = db["product_details"].find_one({"_id": ObjectId(product_id)})["price"] * int(quantity)
            collection.update_one({"customer_id": customer_id},
                                  {"$set": {"product_ids": updated_product_details,
                                            "total_price": db_check["total_price"] + price_change}})
            return json.dumps({"status": "success", "message": "exisiting product quantity updated"}), 200
        else:
            total_price = db_check["total_price"]
            total_price += float(db["product_details"].find_one({"_id": ObjectId(product_id)})["price"]) * float(
                quantity)
            collection.update_one({"customer_id": customer_id},
                                  {"$set": {"product_ids": list(db_check["product_ids"] + [
                                      {"product_id": product_id, "quantity": int(quantity)}]),
                                            "total_price": total_price}})
            return json.dumps({"status": "success", "message": "new product added to cart"}), 200

    return json.dumps({"status": "failed", "message": "User must be logged in."}), 403

# completed
# old code
# @app.route("/add_to_cart", methods=["POST", "PUT"])
# def add_to_cart():
#     user = session.get('user')
#     if user:
#         request_json = request.json

#         customer_id = user['user_name']
#         product_id = request_json["product_id"]
#         quantity = request_json["quantity"]

#         # customer_id = request.args.get("customer_id")
#         # product_id = request.args.get("product_id")
#         # quantity = request.args.get("quantity")

#         collection = db["cart"]

#         db_check = collection.find_one({"customer_id": customer_id})

#         try:

#             if db_check:
#                 total_price = db_check["total_price"]
#                 total_price += float(db["product_details"].find_one({"_id": ObjectId(product_id)})["price"]) * float(quantity)
#                 collection.update_one({"customer_id": customer_id},
#                                       {"$set": {"product_ids": list(db_check["product_ids"] + [{"product_id": product_id, "quantity": int(quantity)}]),
#                                                 "total_price": total_price}})
#             else:
#                 collection.insert_one({
#                     "customer_id": customer_id,
#                     "product_ids": [{"product_id": product_id, "quantity": int(quantity)}],
#                     "total_price": float(db["product_details"].find_one({"_id": ObjectId(product_id)})["price"]) * float(quantity)
#                 })
#             return json.dumps({"status": "success"})
#         except:
#             return json.dumps({"status": "failed"})

#     return json.dumps({"status": "failed"})


# # completed
# @app.route("/rem_from_wishlist", methods=["PUT"])
# def rem_from_wishlist():
#
#     customer_id = request.args.get("customer_id")
#     product_id = request.args.get("product_id")
#
#     collection = db["wishlist"]
#
#     db_check = collection.find_one({"customer_id": customer_id})
#
#     try:
#         if db_check:
#             if product_id in db_check["product_ids"]:
#                 temp_product_ids = db_check["product_ids"]
#                 temp_product_ids.remove(product_id)
#                 collection.update_one({"customer_id": customer_id},
#                                       {"$set": {"product_ids": list(set(temp_product_ids))}})
#             else:
#                 return json.dumps({"status": "failed"})
#         else:
#             return json.dumps({"status": "failed", "message": "customer id not found"}), 404
#         return json.dumps({"status": "success"}), 200
#     except:
#         return json.dumps({"status": "failed"}), 500


# # completed
# @app.route("/rem_from_cart", methods=["PUT"])
# def rem_from_cart():
#
#     customer_id = request.args.get("customer_id")
#     product_id = request.args.get("product_id")
#
#     collection = db["cart"]
#
#     db_check = collection.find_one({"customer_id": customer_id})
#
#     try:
#         if db_check:
#             current_total_price = float(db_check["total_price"])
#             product_ids = [entry["product_id"] for entry in db_check["product_ids"]]
#             if product_id in product_ids:
#                 temp_product_ids = db_check["product_ids"]
#                 price_of_removed_product, updated_product_ids = 0, []
#                 for entry in temp_product_ids:
#                     if entry.get("product_id") == product_id:
#                         price_of_removed_product = float(db["product_details"].find_one({"_id": ObjectId(product_id)})["price"]) * entry.get("quantity")
#                     else:
#                         updated_product_ids.append(entry)
#                 collection.update_one({"customer_id": customer_id},
#                                       {"$set": {"product_ids": updated_product_ids,
#                                                 "total_price": current_total_price - price_of_removed_product}})
#             else:
#                 return json.dumps({"status": "failed", "message": "product id not found"}), 406
#         else:
#             return json.dumps({"status": "failed", "message": "customer id not found"}), 406
#         return json.dumps({"status": "success"}), 200
#     except:
#         return json.dumps({"status": "failed"}), 500


# completed
@app.route("/place_order", methods=["POST"])
def place_order():
    customer_id = session.get('user')['user_id']
    # customer_id = request.args.get("customer_id")
    shipping_address = request.json["shipping_address"]
    # shipping_address = request.args.get("shipping_address")

    if not shipping_address:
        shipping_address = db["customer_details"].find_one({"_id": ObjectId(customer_id)})["shipping_address"]

    collection = db["cart"]

    db_check = collection.find_one({"customer_id": customer_id})

    if db_check:

        # check whether quantity of products exists in inventory stock
        products_present_in_inventory = True
        store_queries_to_run = []
        for product_data in db_check["product_ids"]:
            product_id, product_quantity = product_data["product_id"], product_data["quantity"]
            product_in_db = db["product_details"].find_one({"_id": ObjectId(product_id)})
            if product_in_db:
                if int(product_in_db["stock"]) < int(product_quantity):
                    products_present_in_inventory = False
                    break
                else:
                    store_queries_to_run.append(
                        {"product_id": product_id, "stock": int(product_in_db["stock"]) - int(product_quantity)})

        if products_present_in_inventory:
            for queries in store_queries_to_run:
                if queries["stock"] == 0:
                    db["product_details"].update_one({"_id": ObjectId(queries["product_id"])},
                                                     {"$set": {"stock": queries["stock"], "deleted": True}})
                else:
                    db["product_details"].update_one({"_id": ObjectId(queries["product_id"])},
                                                     {"$set": {"stock": queries["stock"]}})


            # add the current cart to order to fetch the order details in user dashboard
            customer_cart = db_check
            for index, product in enumerate(db_check["product_ids"]):
                product_id = product["product_id"]
                customer_cart["product_ids"][index]["product_details"] = db["product_details"].find_one(
                    {"_id": ObjectId(product_id)})

            shipping = round(min(12, 0.15 * float(db_check["total_price"])), 2)
            db["orders"].insert_one({
                "customer_id": customer_id,
                "shipping_address": shipping_address,
                "order_date": datetime.datetime.now(),
                # "product_ids": db_check["product_ids"],
                "customer_cart": customer_cart,
                "total_price_post_charges": round((float(db_check["total_price"]) + shipping), 2),
                "order_status": "order received"
            })

            db["cart"].delete_one({"customer_id": customer_id})

            return json.dumps({"status": "success"}), 200
        else:
            return json.dumps({"status": "failed", "message": "quantity of a product more than inventory stock"}), 406

    else:
        return json.dumps({"status": "failed", "message": "customer id not found"}), 406


# completed
@app.route("/update_product_details", methods=["PUT"])
def update_product_details():

    user = session.get('user')

    if user and user['is_admin']:


        product_id = request.form["product_id"]
        name = request.form["name"]
        brand = request.form["brand"]
        description = request.form["description"]
        stock = request.form["stock"]
        category = request.form["category"]
        price = request.form["price"]

        # to delete images from server and db
        deleted_images = request.form["deleted_images"].split(",")
        print(deleted_images)
        # to add images from server and db
        files = request.files.getlist('files[]')



        # request_json = request.json
        #
        # product_id = request_json["product_id"]
        # name = request_json["name"]
        # brand = request_json["brand"]
        # description = request_json["description"]
        # stock = request_json["stock"]
        # category = request_json["category"]
        # price = request_json["price"]
        # images = request_json["images"]

        # product_id = request.args.get("product_id")

        # brand = request.args.get("brand")
        # description = request.args.get("description")
        # stock = request.args.get("stock")
        # category = request.args.get("category")
        # price = request.args.get("price")
        # images = request.args.getlist("images")

        collection = db["product_details"]

        db_check = collection.find_one({"_id": ObjectId(product_id)})

        try:
            if db_check:

                if name:
                    collection.update_one({"_id": ObjectId(product_id)},
                                          {"$set": {"name": name}})

                if brand:
                    collection.update_one({"_id": ObjectId(product_id)},
                                          {"$set": {"brand": brand}})
                if description:
                    collection.update_one({"_id": ObjectId(product_id)},
                                          {"$set": {"description": description}})
                if stock:
                    collection.update_one({"_id": ObjectId(product_id)},
                                          {"$set": {"stock": int(stock)}})

                if int(stock) > 0:
                    collection.update_one({"_id": ObjectId(product_id)},
                                          {"$set": {"deleted": False}})

                if category:
                    collection.update_one({"_id": ObjectId(product_id)},
                                          {"$set": {"category": category}})
                if price:
                    price_change = float(price) - float(db_check["price"])
                    collection.update_one({"_id": ObjectId(product_id)},
                                          {"$set": {"price": float(price)}})

                    # put the change in everyones cart who has the updated product_id
                    for entry in db["cart"].find():
                        for product_data in entry["product_ids"]:
                            if product_data["product_id"] == product_id:
                                db["cart"].update_one({"_id": ObjectId(entry["_id"])},
                                                      {"$set": {"total_price": float(entry["total_price"]) + price_change * product_data["quantity"]}})

                #deleted images from mongodb
                if deleted_images:
                    for img in deleted_images:
                        collection.update_one({"_id": ObjectId(product_id)}, {"$pull": {"images": img}})
                        filepath_to_delete = img[3:]
                        try:
                            os.remove(filepath_to_delete)
                            print(filepath_to_delete + " deleted successfull")
                        except OSError as e:
                            print("Error: %s - %s." % (e.filename, e.strerror))

                if files:
                    for file in files:
                        if file and allowed_file(file.filename):
                            filepath = UPLOAD_DEST + str(product_id) + '-' + secure_filename(file.filename)
                            image_filepath = '../' + filepath
                            collection.update_one({"_id": ObjectId(product_id)}, {"$addToSet": {"images": image_filepath}})
                            file.save(filepath)

                return json.dumps({"status": "success"}), 200

            else:
                return json.dumps({"status": "failed", "message": "product id not found"}), 406

        except Exception as e:
            return json.dumps({"status": "failed"}), 500
    return json.dumps({"status": "failed"}), 401


# # completed
# @app.route("/update_cart", methods=["PUT"])
# def update_cart():

#     customer_id = request.args.get("customer_id")
#     product_id = request.args.get("product_id")
#     quantity = request.args.get("quantity")

#     collection = db["cart"]

#     db_check = collection.find_one({"customer_id": customer_id})

#     if db_check:
#         updated_product_details, product_id_found, old_quantity = [], False, None
#         for product_data in db_check["product_ids"]:
#             if product_data["product_id"] == product_id:
#                 product_id_found = True
#                 old_quantity = product_data["quantity"]
#                 updated_product_details.append({"product_id": product_id, "quantity": int(quantity)})
#             else:
#                 updated_product_details.append(product_data)
#     else:
#         return json.dumps({"status": "failed", "message": "customer id not found"})
#     if product_id_found:
#         change_in_quantity = int(quantity) - int(old_quantity)
#         price_change = db["product_details"].find_one({"_id": ObjectId(product_id)})["price"] * change_in_quantity
#         collection.update_one({"customer_id": customer_id}, 
#                               {"$set": {"product_ids": updated_product_details,
#                                         "total_price": db_check["total_price"] + price_change}})
#         return json.dumps({"status": "success"})
#     else:
#         return json.dumps({"status": "failed"})

@app.route("/update_cart", methods=["PUT"])
def update_cart():
    cart_object = request.json['cart']

    collection = db["cart"]

    # total_price = 0
    # for products in cart_object["product_ids"]:
    #     product_details = db["product_details"].find_one({"_id": ObjectId(products["product_id"])})
    #     if product_details:
    #         total_price += float(products["quantity"]) * float(product_details["price"])
    #     else:
    #         return json.dumps({"status": "failed", "message": "product_id not found"}), 406

    # try:
    #     collection.update_one({"customer_id": cart_object["customer_id"]},
    #                           {"$set": {"product_ids": cart_object["product_ids"],
    #                                     "total_price": total_price}})
    try:
        collection.update_one({"customer_id": cart_object["customer_id"]},
                              {"$set": {"product_ids": cart_object["product_ids"],
                                        "total_price": cart_object["total_price"]}})
        return json.dumps({"status": "success"}), 200
    except:
        return json.dumps({"status": "failed"}), 500


# DELETE FUNCTIONS

# # completed
# @app.route("/clear_wishlist", methods=["DELETE"])
# def empty_wishlist():
#
#     customer_id = request.args.get("customer_id")
#
#     collection = db["wishlist"]
#
#     try:
#         collection.delete_one({"customer_id": customer_id})
#         return json.dumps({"status": "success"}), 200
#     except:
#         return json.dumps({"status": "failed", "message": "customer_id not found"}), 406


# # completed
# @app.route("/clear_cart", methods=["DELETE"])
# def empty_cart():
#
#     customer_id = request.args.get("customer_id")
#
#     collection = db["cart"]
#
#     try:
#         collection.delete_one({"customer_id": customer_id})
#         return json.dumps({"status": "success"}), 200
#     except:
#         return json.dumps({"status": "failed", "message": "customer_id not found"}), 406


# completed
@app.route("/rem_from_products", methods=["DELETE"])
def rem_from_products():
    product_id = request.args.get("product_id")
    collection = db["product_details"]

    db_check = collection.find_one({"_id": ObjectId(product_id)})

    try:

        if db_check:

            product_price = db_check["price"]
            collection.update_one({"_id": ObjectId(product_id)}, {"$set": {"deleted": True, "stock": 0}})

            # put the change in everyones cart who has the updated product_id 
            # for entry in db["cart"].find():
            #     updated_product_ids, product_id_found = [], False
            #     for product_data in entry["product_ids"]:
            #         if product_data["product_id"] == product_id:
            #             product_id_found = True
            #             db["cart"].update_one({"_id": ObjectId(entry["_id"])},
            #                                   {"$set": {"total_price": float(entry["total_price"]) - product_price *
            #                                                            product_data["quantity"]}})
            #         else:
            #             updated_product_ids.append(product_data)
            #     if product_id_found:
            #         db["cart"].update_one({"_id": ObjectId(entry["_id"])},
            #                               {"$set": {"product_ids": updated_product_ids}})

            return json.dumps({"status": "success"}), 200

        else:
            return json.dumps({"status": "failed", "message": "product id not found"}), 406

    except:
        return json.dumps({"status": "failed"}), 500


# GET FUNCTIONS

# completed (contains options to filter by category, min price, max price)
@app.route("/get_products", methods=["GET"])
def get_products():

    user = session.get('user')
    searchbox_text = request.args.get("text")
    category = request.args.get("category")
    price_min = request.args.get("price_min")
    price_max = request.args.get("price_max")

    if not searchbox_text:
        searchbox_text = ""

    if not category:
        category = {"$exists": True}
    else:
        category = category.lower()
    if not price_min:
        price_min = 0
    if not price_max:
        price_max = math.pow(10, 4)

    products = db["product_details"]

    # pagination
    limit = int(request.args['limit'])
    page_number = int(request.args['page_number'])
    skips = limit * (page_number - 1)
    price_min = float(price_min)
    price_max = float(price_max)

    if user and user['is_admin']:
        total_documents = products.find({'name': {'$regex': '^' + searchbox_text + '', '$options': 'i'}, "category": category,
                                         "price": {"$gt": price_min, "$lt": price_max}}).count()
        total_pages = math.ceil(total_documents / limit)

        cursor = products.find({'name': {'$regex': '^' + searchbox_text + '', '$options': 'i'}, "category": category,
                                "price": {"$gt": price_min, "$lt": price_max}}).skip(skips).limit(limit)
    else:
        total_documents = products.find({'name': {'$regex': '^' + searchbox_text + '', '$options': 'i'}, "category": category,
                                         "price": {"$gt": price_min, "$lt": price_max}, "deleted": False}).count()
        total_pages = math.ceil(total_documents / limit)

        cursor = products.find({'name': {'$regex': '^' + searchbox_text + '', '$options': 'i'}, "category": category,
                                "price": {"$gt": price_min, "$lt": price_max}, "deleted": False}).skip(skips).limit(limit)

    output = []

    for i in cursor:
        output.append(i)

    return dumps({'products': output, 'total_pages': total_pages}), 200



@app.route("/product_detail/<prod_id>", methods=["GET"])
def product_detail(prod_id):
    print('get_product_detail request made with id', prod_id)
    products = db["product_details"]
    product = dumps(products.find({"_id": ObjectId(prod_id)}))

    is_logged_in = False
    if session.get('user'):
        is_logged_in = True

    return render_template('product-detail.html', product=product, is_logged_in=is_logged_in)


# completed
@app.route("/get_cart", methods=["GET"])
def get_cart():
    user = session.get('user')
    products_collection = db["product_details"]
    cart_collection = db["cart"]
    if user:
        customer_id = user['user_id']
        customer_cart = db["cart"].find_one({"customer_id": customer_id})
        if customer_cart:
            cart_id = customer_cart['_id']
            for index, product in enumerate(customer_cart["product_ids"]):
                product_id = product["product_id"]
                # getting product details for each product
                product_details = products_collection.find_one({"_id": ObjectId(product_id)})
                stock = product_details['stock']
                if product_details['stock'] != 0:
                    customer_cart["product_ids"][index]["product_details"] = db["product_details"].find_one(
                        {"_id": ObjectId(product_id)})
                else:
                    # remove these product IDs from cart collection
                    p_idx = next((index for (index, d) in enumerate(customer_cart['product_ids']) if d["product_id"] == product_id), None)
                    customer_cart['product_ids'].pop(p_idx)
                    cart_collection.update_one({"_id": cart_id}, {"$pull": {"product_ids": {"product_id": product_id}}})

            return dumps(customer_cart), 200
        return json.dumps([]), 200

    return json.dumps({"status": "failed"}), 401


# # completed
# @app.route("/get_wishlist", methods=["GET"])
# def get_wishlist():
#     customer_id = request.args.get("customer_id")
#     wishlist = db["wishlist"]
#     return dumps(list(wishlist.find({"customer_id": customer_id}))), 200


# completed
@app.route("/get_orders", methods=["GET"])
def get_orders():
    # customer_id = request.args.get("customer_id")
    customer_id = session.get('user')['user_id']
    if not customer_id:
        customer_id = {"$exists": True}
    orders = db["orders"]
    return dumps(list(orders.find({"customer_id": customer_id}))), 200


if __name__ == "__main__":
    app.run()
