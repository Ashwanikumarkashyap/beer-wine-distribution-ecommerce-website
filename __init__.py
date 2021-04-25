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
import phonenumbers
from password_strength import PasswordPolicy
from werkzeug.utils import secure_filename

app = Flask(__name__)

username = urllib.parse.quote("admin")
password = urllib.parse.quote("admin")
url = "mongodb+srv://" + username + ":" + password + "@cluster0.riul3.mongodb.net/beer_wine_website?retryWrites=true&w=majority"
cluster = pymongo.MongoClient(url)
db = cluster["beer_wine_website"]

ALLOWED_EXTENSIONS = set(['png', 'jpg', 'jpeg'])
UPLOAD_DEST = 'static/prod_images/'

app.secret_key = 'my secret key'

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

    user_name = request_json["user_name"]
    full_name = request_json["full_name"]
    email_id = request_json["email_id"]
    password = request_json["password"]
    address = request_json["address"]
    contact_no = request_json["contact_no"]
    govt_id = request_json["govt_id"]

    # user_name = request.args.get("user_name")
    # full_name = request.args.get("full_name")
    # email_id = request.args.get("email_id")
    # password = request.args.get("password")
    # address = request.args.get("address")
    # contact_no = request.args.get("contact_no")
    # govt_id = request.args.get("govt_id")

    collection = db["customer_details"]

    if collection.find_one({"user_name": user_name}):
        return json.dumps({"status": "failed", "message": "username already exists"})
    if collection.find_one({"email_id": email_id}):
        return json.dumps({"status": "failed", "message": "email address already exists"})
    if collection.find_one({"contact_no": contact_no}):
        return json.dumps({"status": "failed", "message": "contact no already exists"})
    if collection.find_one({"govt_id": govt_id}):
        return json.dumps({"status": "failed", "message": "govt_id already exists"})

    # email address validation
    email_regex = r"^(\w|\.|\_|\-)+[@](\w|\_|\-|\.)+[.]\w{2,3}$"
    if not re.search(email_regex, email_id):
        return json.dumps({"status": "failed", "message": "invalid email address"})

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
        return json.dumps({"status": "failed", "message": "password not strong enough"})
    
    # phone number validation
    ph_number = phonenumbers.parse(str(contact_no), "US")
    if not phonenumbers.is_valid_number(ph_number):
        return json.dumps({"status": "failed", "message": "invalid phone number"})

    try:
        collection.insert_one({
            "user_name": user_name,
            "full_name": full_name,
            "email_id": email_id,
            "password": bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()),
            "address": address,
            "contact_no": contact_no,
            "govt_id": govt_id,
            "isAdmin": False
        })
        res = make_response(json.dumps({"status": "success"}))
        # res.set_cookie(
        #     "data",
        #     max_age=3600,
        #     expires=None,
        #     path=request.path,
        #     domain=None,
        #     secure=False
        # )
        session['user'] = {'user_name': user_name, 'is_admin': False}
        return res
    except:
        return json.dumps({"status": "failed"})


# completed
@app.route("/val_sign_in", methods=["POST"])
def val_sign_in():
    request_json = request.json

    user_name = request_json["user_name"]
    password = request_json["password"]

    is_admin = request_json["is_admin"]


    # user_name = request.args.get("user_name")
    # password = request.args.get("password")

    collection = db["customer_details"]

    if is_admin:
        db_check = collection.find_one({"user_name": user_name, "isAdmin": is_admin})
    else:
        db_check = collection.find_one({"user_name": user_name})

    if db_check and bcrypt.checkpw(password.encode("utf-8"), db_check["password"]):
        res = make_response(json.dumps({
            "status": "success",
        }))

        session['user'] = {'user_name': user_name, 'is_admin': is_admin}
        # res.set_cookie(
        #     "data",
        #     max_age=3600,
        #     expires=None,
        #     path=request.path,
        #     domain=None,
        #     secure=False
        # )
        return res
    
    return json.dumps({"status": "failed", "message": "invalid login credentials"})


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


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
        category = request.form["category"]
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

            return json.dumps({"status": "success"})
        except:
            return json.dumps({"status": "failed"})
    return json.dumps({"status": "failed"})

# POST/PUT FUNCTIONS


# completed
@app.route("/add_to_wishlist", methods=["POST", "PUT"])
def add_to_wishlist():

    customer_id = request.args.get("customer_id")
    product_id = request.args.get("product_id")

    collection = db["wishlist"]

    db_check = collection.find_one({"customer_id": customer_id})

    try:

        if db_check:
            collection.update_one({"customer_id": customer_id}, 
            {"$set": {"product_ids": list(set(db_check["product_ids"] + [product_id]))}})
        else:
            collection.insert_one({
                "customer_id": customer_id,
                "product_ids": [product_id]
            })

        return json.dumps({"status": "success"})
    
    except:
        return json.dumps({"status": "failed"})


# completed
@app.route("/add_to_cart", methods=["POST", "PUT"])
def add_to_cart():
    user = session.get('user')
    if user:
        request_json = request.json

        customer_id = user['user_name']
        product_id = request_json["product_id"]
        quantity = request_json["quantity"]

        # customer_id = request.args.get("customer_id")
        # product_id = request.args.get("product_id")
        # quantity = request.args.get("quantity")

        collection = db["cart"]

        db_check = collection.find_one({"customer_id": customer_id})

        try:

            if db_check:
                total_price = db_check["total_price"]
                total_price += float(db["product_details"].find_one({"_id": ObjectId(product_id)})["price"]) * float(quantity)
                collection.update_one({"customer_id": customer_id},
                                      {"$set": {"product_ids": list(db_check["product_ids"] + [{"product_id": product_id, "quantity": int(quantity)}]),
                                                "total_price": total_price}})
            else:
                collection.insert_one({
                    "customer_id": customer_id,
                    "product_ids": [{"product_id": product_id, "quantity": int(quantity)}],
                    "total_price": float(db["product_details"].find_one({"_id": ObjectId(product_id)})["price"]) * float(quantity)
                })
            return json.dumps({"status": "success"})
        except:
            return json.dumps({"status": "failed"})

    return json.dumps({"status": "failed"})


# completed
@app.route("/rem_from_wishlist", methods=["PUT"])
def rem_from_wishlist():

    customer_id = request.args.get("customer_id")
    product_id = request.args.get("product_id")

    collection = db["wishlist"]

    db_check = collection.find_one({"customer_id": customer_id})

    try:
        if db_check:
            if product_id in db_check["product_ids"]:
                temp_product_ids = db_check["product_ids"]
                temp_product_ids.remove(product_id)
                collection.update_one({"customer_id": customer_id}, 
                                      {"$set": {"product_ids": list(set(temp_product_ids))}})
            else:
                return json.dumps({"status": "failed"})
        else:
            return json.dumps({"status": "failed", "message": "customer id not found"})
        return json.dumps({"status": "success"})
    except:
        return json.dumps({"status": "failed"})


# completed
@app.route("/rem_from_cart", methods=["PUT"])
def rem_from_cart():

    customer_id = request.args.get("customer_id")
    product_id = request.args.get("product_id")

    collection = db["cart"]

    db_check = collection.find_one({"customer_id": customer_id})

    try:
        if db_check:
            current_total_price = float(db_check["total_price"])
            product_ids = [entry["product_id"] for entry in db_check["product_ids"]]
            if product_id in product_ids:
                temp_product_ids = db_check["product_ids"]
                price_of_removed_product, updated_product_ids = 0, []
                for entry in temp_product_ids:
                    if entry.get("product_id") == product_id:
                        price_of_removed_product = float(db["product_details"].find_one({"_id": ObjectId(product_id)})["price"]) * entry.get("quantity")
                    else:
                        updated_product_ids.append(entry)
                collection.update_one({"customer_id": customer_id}, 
                                      {"$set": {"product_ids": updated_product_ids,
                                                "total_price": current_total_price - price_of_removed_product}})
            else:
                return json.dumps({"status": "failed"})
        else:
            return json.dumps({"status": "failed", "message": "customer id not found"})
        return json.dumps({"status": "success"})
    except:
        return json.dumps({"status": "failed"})


# incomplete
@app.route("/proceed_to_checkout", methods=["POST"])
def proceed_to_checkout():

    customer_id = request.args.get("customer_id")
    shipping_address = request.args.get("shipping_address")

    if not shipping_address:
        shipping_address = db["customer_details"].find_one({"_id": ObjectId(customer_id)})["address"]

    collection = db["cart"]

    db_check = collection.find_one({"customer_id": customer_id})

    if db_check:

        # check whether quantity of products exisits in inventory stock
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
                    store_queries_to_run.append({"product_id": product_id, "stock": int(product_in_db["stock"]) - int(product_quantity)})
        
        if products_present_in_inventory:
            for queries in store_queries_to_run:
                db["product_details"].update_one({"_id": ObjectId(queries["product_id"])},
                                                 {"$set": {"stock": queries["stock"]}})
        
            db["orders"].insert_one({
                "customer_id": customer_id,
                "shipping_address": shipping_address,
                "order_date": datetime.datetime.now(),
                "product_ids": db_check["product_ids"],
                "total_price": float(db_check["total_price"]),
                "total_price_post_charges": float(db_check["total_price"]) + 0.5 * float(db_check["total_price"]),
                "order_status": "order received"
            })
            
            db["cart"].delete_one({"customer_id": customer_id})

            return json.dumps({"status": "success"})
        else:
            return json.dumps({"status": "failed", "message": "quantity of a product more than inventory stock"})

    else:
        return json.dumps({"status": "failed", "message": "customer id not found"})


# completed
@app.route("/update_product_details", methods=["PUT"])
def update_product_details():

    user = session.get('user')

    if user and user['is_admin']:
        request_json = request.json

        product_id = request_json["product_id"]
        name = request_json["name"]
        brand = request_json["brand"]
        description = request_json["description"]
        stock = request_json["stock"]
        category = request_json["category"]
        price = request_json["price"]
        images = request_json["images"]

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
                if category:
                    collection.update_one({"_id": ObjectId(product_id)},
                                        {"$set": {"category": category}})
                if images:
                    collection.update_one({"_id": ObjectId(product_id)},
                                        {"$set": {"images": images}})
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

                return json.dumps({"status": "success"})

            else:
                return json.dumps({"status": "failed", "message": "product id not found"})

        except:
            return json.dumps({"status": "failed"})
    return json.dumps({"status": "failed"})


# completed
@app.route("/update_cart", methods=["PUT"])
def update_cart():

    customer_id = request.args.get("customer_id")
    product_id = request.args.get("product_id")
    quantity = request.args.get("quantity")

    collection = db["cart"]

    db_check = collection.find_one({"customer_id": customer_id})

    if db_check:
        updated_product_details, product_id_found, old_quantity = [], False, None
        for product_data in db_check["product_ids"]:
            if product_data["product_id"] == product_id:
                product_id_found = True
                old_quantity = product_data["quantity"]
                updated_product_details.append({"product_id": product_id, "quantity": int(quantity)})
            else:
                updated_product_details.append(product_data)
    else:
        return json.dumps({"status": "failed", "message": "customer id not found"})
    if product_id_found:
        change_in_quantity = int(quantity) - int(old_quantity)
        price_change = db["product_details"].find_one({"_id": ObjectId(product_id)})["price"] * change_in_quantity
        collection.update_one({"customer_id": customer_id}, 
                              {"$set": {"product_ids": updated_product_details,
                                        "total_price": db_check["total_price"] + price_change}})
        return json.dumps({"status": "success"})
    else:
        return json.dumps({"status": "failed"})


# DELETE FUNCTIONS

# completed
@app.route("/clear_wishlist", methods=["DELETE"])
def empty_wishlist():

    customer_id = request.args.get("customer_id")

    collection = db["wishlist"]

    try:
        collection.delete_one({"customer_id": customer_id})
        return json.dumps({"status": "success"})
    except:
        return json.dumps({"status": "failed"})


# completed
@app.route("/clear_cart", methods=["DELETE"])
def empty_cart():
    
    customer_id = request.args.get("customer_id")

    collection = db["cart"]

    try:
        collection.delete_one({"customer_id": customer_id})
        return json.dumps({"status": "success"})
    except:
        return json.dumps({"status": "failed"})


# completed
@app.route("/rem_from_products", methods=["DELETE"])
def rem_from_products():
    
    product_id = request.args.get("product_id")
    collection = db["product_details"]

    db_check = collection.find_one({"_id": ObjectId(product_id)})

    try:

        if db_check:

            product_price = db_check["price"]
            collection.update_one({"_id": ObjectId(product_id)}, {"$set": {"deleted": True}})

            # put the change in everyones cart who has the updated product_id 
            for entry in db["cart"].find():
                updated_product_ids, product_id_found = [], False
                for product_data in entry["product_ids"]:
                    if product_data["product_id"] == product_id:   
                        product_id_found = True
                        db["cart"].update_one({"_id": ObjectId(entry["_id"])}, 
                                            {"$set": {"total_price": float(entry["total_price"]) - product_price * product_data["quantity"]}})
                    else:
                        updated_product_ids.append(product_data)
                if product_id_found:
                    db["cart"].update_one({"_id": ObjectId(entry["_id"])}, 
                                          {"$set": {"product_ids": updated_product_ids}})

            return json.dumps({"status": "success"})

        else:
            return json.dumps({"status": "failed", "message": "product id not found"})
    
    except:
        return json.dumps({"status": "failed"})


# GET FUNCTIONS

# completed (contains options to filter by category, min price, max price)
@app.route("/get_products", methods=["GET"])
def get_products():

    category = request.args.get("category")
    price_min = request.args.get("price_min")
    price_max = request.args.get("price_max")

    if not category:
        category = {"$exists": True}
    if not price_min:
        price_min = 0
    if not price_max:
        price_max = math.pow(10, 4)

    products = db["product_details"]

    #pagination
    limit = int(request.args['limit'])
    page_number = int(request.args['page_number'])

    starting_id = products.find({"category": category, "price": {"$gte": price_min, "$lte": price_max}}).sort('_id', pymongo.ASCENDING)
    last_id = starting_id[page_number]['_id']

    #return dumps(list(products.find({"category": category, "price": {"$gte": price_min, "$lte": price_max}})))
    all_products_with_page_limit = products.find({"_id": {"$gte" : last_id}, "category": category, "price": {"$gte": price_min, "$lte": price_max}}).sort('_id', pymongo.ASCENDING).limit(limit)
    output = []

    for i in all_products_with_page_limit:
        output.append(i);

    next_url = '/get_products?limit=' + str(limit) + '&page_number=' + str(page_number+limit)
    prev_url = '/get_products?limit=' + str(limit) + '&page_number=' + str(page_number-limit)

    return dumps({'result': output, 'prev_url': prev_url, 'next_url': next_url})


# search products through search bar
@app.route("/get_products_with_search", methods=["GET"])
def get_products_with_search():

    searchbox_text = request.args.get("text")

    products = db["product_details"]

    #pagination
    limit = int(request.args['limit'])
    page_number = int(request.args['page_number'])

    starting_id = products.find({'$text': { '$search':  '\"'+searchbox_text+'\"'}}).sort('_id', pymongo.ASCENDING)
    last_id = starting_id[page_number]['_id']

    searched_products_with_page_limit = products.find({"_id": {"$gte" : last_id}, '$text': { '$search':  '\"'+searchbox_text+'\"'}}).sort('_id', pymongo.ASCENDING).limit(limit)
    output = []

    for i in searched_products_with_page_limit:
        output.append(i);

    next_url = '/get_products_with_search?limit=' + str(limit) + '&page_number=' + str(page_number+limit)
    prev_url = '/get_products_with_search?limit=' + str(limit) + '&page_number=' + str(page_number-limit)

    return dumps({'result': output, 'prev_url': prev_url, 'next_url': next_url})


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
    if user:
        customer_id = user['user_name']
        # customer_id = request.args.get("customer_id")
        cart = db["cart"]
        return dumps(list(cart.find({"customer_id": customer_id})))

    return json.dumps({"status": "failed"})


# completed
@app.route("/get_wishlist", methods=["GET"])
def get_wishlist():
    customer_id = request.args.get("customer_id")
    wishlist = db["wishlist"]
    return dumps(list(wishlist.find({"customer_id": customer_id})))


# completed
@app.route("/get_orders", methods=["GET"])
def get_orders():
    customer_id = request.args.get("customer_id")
    if not customer_id:
        customer_id = {"$exists": True}
    orders = db["orders"]
    return dumps(list(orders.find({"customer_id": customer_id})))


if __name__ == "__main__":
    app.run()