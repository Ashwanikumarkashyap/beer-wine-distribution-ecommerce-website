let isLoggedIn = false;

let sliderData = ['slider-1.jpg', 'slider-2.jpg', 'slider-2.jpg'];

let pageLimit = 5;
let totalPages = 2;

let products = [
    {   
        "id": 1,
        "productName": "Product 1",
        "productImage": "../static/img/product-1.jpg",
        "productPrice": 34,
        "description": "Some text goes here that describes the image",
    },
    {   
        "id": 2,
        "productName": "Product 2",
        "productImage": "../static/img/product-2.jpg",
        "productPrice": 56,
        "description": "Some text goes here that describes the image",
    },
    {   
        "id": 3,
        "productName": "Product 3",
        "productImage": "../static/img/product-3.jpg",
        "productPrice": 67,
        "description": "Some text goes here that describes the image",
    },
    {   
        "id": 4,
        "productName": "Product 4",
        "productImage": "../static/img/product-4.jpg",
        "productPrice": 120,
        "description": "Some text goes here that describes the image",
    },
    {   
        "id": 5,
        "productName": "Product 5",
        "productImage": "../static/img/product-5.jpg",
        "productPrice": 90,
        "description": "Some text goes here that describes the image",
    },
    {   
        "id": 6,
        "productName": "Product 6",
        "productImage": "../static/img/product-6.jpg",
        "productPrice": 120,
        "description": "Some text goes here that describes the image",
    },
    {   
        "id": 7,
        "productName": "Product 7",
        "productImage": "../static/img/product-7.jpg",
        "productPrice": 550,
        "description": "Some text goes here that describes the image",
    },
    {   
        "id": 8,
        "productName": "Product 8",
        "productImage": "../static/img/product-8.jpg",
        "productPrice": 270,
        "description": "Some text goes here that describes the image",
    },
    {   
        "id": 9,
        "productName": "Product 9",
        "productImage": "../static/img/product-9.jpg",
        "productPrice": 190,
        "description": "Some text goes here that describes the image",
    },
];

$( document ).ready(function() {

    $('#search-input').keyup(function(event){
        var keycode = (event.keyCode ? event.keyCode : event.which);
        if(keycode == '13'){
            getSearchPage();  
        }
    });
});


// function creatLoginNav() {
//     let userAccountNavHtml = '';
//     let creatLoginNav = $('#user-account-nav')
//     if (!isLoggedIn) {
//         userAccountNavHtml = '<div class="nav-item dropdown">' + 
//             '<a href="#" class="nav-link dropdown-toggle" data-toggle="dropdown">User Account</a>' +
//             '<div class="dropdown-menu">' +
//                 '<a href="/login" class="dropdown-item">Login</a>' +
//                 '<a href="/login" class="dropdown-item">Register</a>' +
//             '</div>' +
//         '</div>';
//     } else {
//         userAccountNavHtml = '<a href="/login" class="nav-item nav-link">My Account</a>'
//     }
//     creatLoginNav.html(userAccountNavHtml)
// }

// function getProducts(category, minPrice, maxPrice, callback) {
    
//     let data = {}

//     if (category) 
//         data.category = category;        

//     if (minPrice)
//         data.min_price = minPrice

//     if (maxPrice)
//         data.max_price = max_price
//     showLoader();
//     $.ajax({
//         url: '/get_products',
//         type: 'GET',
//         data: data,
//         dataType: "json",
//         success: function (response) {
//             hideLoader();
//             if (callback)
//                 callback(response);
//         },
//         error: function (error) {
//             hideLoader();
//             console.log(error);
//         }
//     })
// }

function getProducts(pg, limit, category, minPrice, maxPrice, callback) {
    
    let data = {
        'page_number': pg,
        'limit': limit,
    }

    if (category) 
        data.category = category;        

    if (minPrice)
        data.price_min = minPrice

    if (maxPrice)
        data.price_max = maxPrice

    showLoader();
    $.ajax({
        url: '/get_products',
        type: 'GET',
        data: data,
        dataType: "json",
        success: function (response) {
            hideLoader();
            if (callback)
                callback(response);
        },
        error: function (error) {
            hideLoader();
            console.log(error);
            showErrorPopup();
        }
    })
}


function getProductsWithSearch(searchQuery, pg, limit, category, minPrice, maxPrice, callback) {
    
    let data = {
        'page_number': pg,
        'limit': limit,
    }

    if (searchQuery) {
        data.text = searchQuery;
    }

    if (category) 
        data.category = category;        

    if (minPrice)
        data.price_min = minPrice

    if (maxPrice)
        data.price_max = maxPrice

    showLoader();
    $.ajax({
        url: '/get_products',
        type: 'GET',
        data: data,
        dataType: "json",
        success: function (response) {
            hideLoader();
            if (callback)
                totalPages = response.total_pages
                callback(response.products);
        },
        error: function (error) {
            hideLoader();
            console.log(error);
            showErrorPopup();
        }
    })
}


function addToCart(productId, qty, isProdId, callback) {

    if (!isProdId)
        productId = productId.split("-")[1];
    
    requestData = {
        'quantity': qty,
        'product_id': productId,
    }
    showLoader();
    $.ajax({
        type: "POST",
        url: "/add_to_cart",
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        data: JSON.stringify(requestData),
        success: function (response) {
            hideLoader();
            console.log('success\n', response);
            if (callback)
                callback();
        },
        error: function (error) {
            hideLoader();
            console.log('error', error);
            showErrorPopup(null, error.responseJSON.message);
        }
    })

    return false;
}

function goToCartPage() {
    window.location.href = "/cart";
    return false;
}

// function addToFav(id, callback) {
//     let productId = id.split("-")[1];
//     console.log(`add to favourite called for id ${productId}`);
//     return false;
// }

function showLoader() {
    $("#loader-wrapper").css("display", "flex");
}

function hideLoader() {
    $("#loader-wrapper").css("display", "none");
}

function getProdDetail(id, callback) {
    let productId = id.split("-")[1];
    window.location.href = `/product_detail/${productId}`;
    return false;
}

function getSearchPage() {
    let searchQuery = $('#search-input').val();
    if (searchQuery.trim() != "") {
        window.location.href = `/get_search_page/${searchQuery}`;
    }
}

function getCart(callback) {

    showLoader();
    $.ajax({
        url: '/get_cart',
        type: 'GET',
        dataType: "json",
        success: function (response) {
            hideLoader();
            cartData = response;
            if (callback)
                callback(response);
        },
        error: function (error) {
            hideLoader();
            console.log(error);
            showErrorPopup();
        }
    })
}

function showErrorPopup(title, message, redirect) {

    if (redirect) {
        $("#error-redirect").css("display", "block");
        $("#error-okay").css("display", "none");
        $("#error-redirect").attr("onclick",'redirect("' + redirect + '")');
    } else {
        $("#error-redirect").css("display", "none");
        $("#error-okay").css("display", "block");
    }

    if (title) {
        $("#error-heading").text(title);
    } else {
        $("#error-heading").text("Error Occured");
    }

    if (message) {
        $("#error-message").text(message);
    } else {
        $("#error-message").text("Something went wrong.");
    }

    $('#error-modal').modal('show');
}

function redirect(address) {
    window.location.href = "/" + address;
}

function fetchAddress() {
    let address = {};

    let firstName = $("#address-fname").val();
    let lastName = $("#address-lname").val();
    let email = $("#address-email").val();
    let mobile = $("#address-mobile").val();
    let addressText = $("#address-text").val();
    let country = $("#address-country").val();
    let city = $("#address-city").val();
    let state = $("#address-state").val();
    let zip = $("#address-zip").val();

    let emailValRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    var emailCheck = new RegExp(emailValRegex);

    if (!emailCheck.test(email)) { 
        showErrorPopup("Invalid Email Address", "Please Enter a valid Email Adresss");
        return false;
    }

    if (firstName.trim() == "" || lastName.trim() == "" || email.trim() == "" || mobile.trim() == "" || 
    country.trim() == "" || city.trim() == "" || state.trim() == "" || zip.trim() == "" || addressText.trim() == "") {
        showErrorPopup("Missing Required Fields", "All the required input address fields should be filled to place the order.");
        return false;
    }

    address.first_name = firstName;
    address.last_name = lastName;
    address.email = email;
    address.phone = mobile;
    address.address = addressText;
    address.country = country;
    address.city = city;
    address.state = state;
    address.zip_code = zip;
    return address;
}

function updateAddress() {
    let addressReq = fetchAddress();

    showLoader();
    $.ajax({
        type: "POST",
        url: "/add_shipping_address",
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        data: JSON.stringify(addressReq),
        success: function (response) {
            hideLoader();
            console.log('success, \n', response);
        },
        error: function (error) {
            hideLoader();
            console.log('error', error);
            showErrorPopup();
        }
    })
}

function getAddress(callback) {
    showLoader();
    $.ajax({
        url: '/get_shipping_address',
        type: 'GET',
        dataType: "json",
        success: function (response) {
            hideLoader();
            cartData = response;
            if (callback)
                callback(response.result);
        },
        error: function (error) {
            hideLoader();
            console.log(error);
            showErrorPopup();
        }
    })
}

function fillAddress(address) {
    if ($("#address-details")) {
        $("#address-fname").val(address.first_name);
        $("#address-lname").val(address.last_name);
        $("#address-email").val(address.email);
        $("#address-mobile").val(address.phone);
        $("#address-text").val(address.address);
        $("#address-country").val(address.country);
        $("#address-city").val(address.city);
        $("#address-state").val(address.state);
        $("#address-zip").val(address.zip_code);
    }
}