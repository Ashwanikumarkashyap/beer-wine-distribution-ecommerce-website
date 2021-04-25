let isLoggedIn = false;

let sliderData = ['slider-1.jpg', 'slider-2.jpg', 'slider-2.jpg'];

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

function getProducts(category, minPrice, maxPrice, callback) {
    
    let data = {}

    if (category) 
        data.category = category;        

    if (minPrice)
        data.min_price = minPrice

    if (maxPrice)
        data.max_price = max_price
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
        }
    })
}

function getProducts1(pg, limit, category, minPrice, maxPrice, callback) {
    
    let data = {
        'page_number': pg,
        'limit': limit,
    }

    if (category) 
        data.category = category;        

    if (minPrice)
        data.min_price = minPrice

    if (maxPrice)
        data.max_price = max_price
    showLoader();
    $.ajax({
        url: '/get_products',
        type: 'GET',
        data: data,
        dataType: "json",
        success: function (response) {
            hideLoader();
            if (callback)
                callback(response.result);
        },
        error: function (error) {
            hideLoader();
            console.log(error);
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
        },
        error: function (error) {
            hideLoader();
            console.log('error', error);
        }
    })

    return false;
}

function addToFav(id, callback) {
    let productId = id.split("-")[1];
    console.log(`add to favourite called for id ${productId}`);
    return false;
}

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