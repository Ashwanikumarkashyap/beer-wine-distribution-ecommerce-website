
let filter = {
    "searchQuery" : "",
    "category" : "",
    "minPrice" : "",
    "maxPrice" : ""
}

$( document ).ready(function() {

    // creatLoginNav();


    // getProducts(null, null, null, createProductList);
    // getProducts(1, pageLimit, null, null, null, createProductList);
    // createProductList(products);

    $('#filter-search').keyup(function(event){
        var keycode = (event.keyCode ? event.keyCode : event.which);
        if(keycode == '13'){
            filterSearch();  
        }
    });

    // should be called after creating every UI elements
    applyTemplateAnimation();
});


function createProductList(products) {
    let prodListHtml = '';
    
    let prodListPanel = $('#product-list-wrapper')
    
    products.forEach((data)=> {
        prodListHtml+= '<div class="col-md-3">' + 
            '<div class="product-item">' +
                '<div class="product-title">' + 
                    `<a id="name-${data._id.$oid}" href="#">${data.name}</a>` + 
                '</div>' +
                '<div class="product-image">' +
                    '<a href="product-detail.html">' +
                        `<img src="${data.images[0]}" alt="Product Image">` +
                    '</a>' +
                    '<div class="product-action">' +
                        `<a id="cart-${data._id.$oid}" onclick="return addToCart(this.id, 1, false)" href="#"><i class="fa fa-cart-plus"></i></a>` +
                        // `<a id="favourite-${data._id.$oid}" onclick="return addToFav(this.id)" href="#"><i class="fa fa-heart"></i></a>` +
                        `<a id="detail-${data._id.$oid}" onclick="return getProdDetail(this.id)" href="product-detail.html"><i class="fa fa-search"></i></a>` +
                    '</div>' +
                '</div>' +
                '<div class="product-price">' +
                    `<h3><span>$</span>${data.price}</h3>` +
                    `<a id="cart-${data._id.$oid}" class="btn" href="" onclick="return addToCart(this.id, 1, false, goToCartPage)"><i class="fa fa-shopping-cart"></i>Buy Now</a>` +
                '</div>' +
            '</div>' +
        '</div>'
    })
    prodListPanel.html(prodListHtml)

      
    if ($('#my-pages').children().length == 0) {
    // if ($("#my-pages").html().length == 0) {
        let myPagesHtml = '';
        for (let i=0; i<3 && i <totalPages; i++) {
            if (i==0)
                myPagesHtml+=  `<li onclick="getPage(this)" class="page-item active"><a class="page-link page-text" href="#">${(i+1)}</a></li>`;
            else 
                myPagesHtml+=  `<li onclick="getPage(this)" class="page-item"><a class="page-link page-text" href="#">${(i+1)}</a></li>`;
        }

        if (totalPages <=3) {
            $("#next-page").addClass("disabled");
        }

        $("#my-pages").html(myPagesHtml);
    }

    if (products.length <=0) {
        $("#pagination-wrapper").css("display", "none");
    } else {
        $("#pagination-wrapper").css("display", "block");
    }
}

function getPage(pageDiv) {
    let page = parseInt($(pageDiv).text());
    $('.active').removeClass("active");
    $(pageDiv).addClass("active");

    // let searchQuery = $("#filter-search").val();
    // if (searchQuery.trim()== "") {
    //     searchQuery = null;
    // }

    // getProductsWithSearch(searchQuery, page, pageLimit, null, null, null, createProductList);

    filterSearch(page);
}

function nextPage() {
    
    let firstPageNo = parseInt($(".page-text").first().text());
    let lastPgNo = parseInt($(".page-text").last().text());

    if (lastPgNo == totalPages) {
        $("next-page").addClass("disabled");
        return;
    } else {
        $("next-page").removeClass("disabled");
    }

    // let searchQuery = $("#filter-search").val();
    // if (searchQuery.trim()== "") {
    //     searchQuery = null;
    // }

    // getProductsWithSearch(searchQuery, (pageNo+1), pageLimit, null, null, null, createProductList);

    filterSearch((pageNo+1));

    $(".page-text").each(function(){
        let page = parseInt($(this).text());
        $(this).text(page+1);
    });
}

function prevPage() {

    let lastPgNo = parseInt($(".page-text").last().text());
    let firstPageNo = parseInt($(".page-text").first().text());

    if (firstPageNo == 1) {
        $("prev-page").addClass("disabled");
        return;
    } else {
        $("prev-page").removeClass("disabled");
    }

    // let searchQuery = $("#filter-search").val();
    // if (searchQuery.trim()== "") {
    //     searchQuery = null;
    // }

    // getProductsWithSearch(searchQuery, (pageNo-1), pageLimit, null, null, null, createProductList);

    filterSearch((pageNo-1));

    $(".page-text").each(function(){ 
        let page = parseInt($(this).text());
        $(this).text(page-1);
    });
}

function searchProducts(searchQuery) {

    searchQuery = searchQuery.trim();
    $("#filter-search").val(searchQuery);
    filter.searchQuery = searchQuery;
    $("#my-pages").html("");
    if (searchQuery) {
        getProductsWithSearch(searchQuery, 1, pageLimit, null, null, null, createProductList);
    } else {
        let searchQuery = $('#search-input').val();
        getProductsWithSearch(searchQuery, 1, pageLimit, null, null, null, createProductList);
    }
}

// function filterSearch(page) {
//     let pageReq = 1;

//     if (page) {
//         pageReq = page;
//     } else {
//         $("#my-pages").html("");
//     }

//     let searchQuery = $("#filter-search").val();
//     if (searchQuery.trim() == "") {
//         searchQuery == null;
//     }

//     let cat = $("#category-input").val();
//     if (cat == "Select Category") {
//         cat = null;
//     }

//     let minPrice = $("#min-price-input").val();
//     if (minPrice == "") {
//         minPrice = null;
//     }

//     let maxPrice = $("#max-price-input").val();
//     if (maxPrice == "") {
//         maxPrice = null;
//     }

//     getProductsWithSearch(searchQuery, pageReq, pageLimit, cat, parseInt(minPrice), parseInt(maxPrice), createProductList);
// }

function setFilter() {
    let searchQuery = $("#filter-search").val();
    if (searchQuery.trim() == "") {
        searchQuery == null;
    }

    let cat = $("#category-input").val();
    if (cat == "Select Category") {
        cat = null;
    }

    let minPrice = $("#min-price-input").val();
    if (minPrice == "") {
        minPrice = null;
    }

    let maxPrice = $("#max-price-input").val();
    if (maxPrice == "") {
        maxPrice = null;
    }

    filter.searchQuery = searchQuery;
    filter.category = cat;
    filter.minPrice = minPrice;
    filter.maxPrice = maxPrice;
    $("#my-pages").html("");
    filterSearch(1);
}

function filterSearch(page) {
    let pageReq = 1;

    if (page) {
        pageReq = page;
    } else {
        $("#my-pages").html("");
    }

    // let searchQuery = $("#filter-search").val();
    // if (searchQuery.trim() == "") {
    //     searchQuery == null;
    // }

    // let cat = $("#category-input").val();
    // if (cat == "Select Category") {
    //     cat = null;
    // }

    // let minPrice = $("#min-price-input").val();
    // if (minPrice == "") {
    //     minPrice = null;
    // }

    // let maxPrice = $("#max-price-input").val();
    // if (maxPrice == "") {
    //     maxPrice = null;
    // }

    getProductsWithSearch(filter.searchQuery, pageReq, pageLimit, filter.category, parseInt(filter.minPrice), parseInt(filter.maxPrice), createProductList);
}