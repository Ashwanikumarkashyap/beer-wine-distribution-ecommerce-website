$( document ).ready(function() {

    // creatLoginNav();


    // getProducts(null, null, null, createProductList);
    // getProducts(1, pageLimit, null, null, null, createProductList);
    // createProductList(products);

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
                    `<a id="cart-${data._id.$oid}" class="btn" href=""><i class="fa fa-shopping-cart"></i>Buy Now</a>` +
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

}

function getPage(pageDiv) {
    let page = parseInt($(pageDiv).text());
    $('.active').removeClass("active");
    $(pageDiv).addClass("active");
    getProducts(page, pageLimit, null, null, null, createProductList);
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

    getProducts((pageNo+1), pageLimit, null, null, null, createProductList);

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

    getProducts((pageNo-1), pageLimit, null, null, null, createProductList);

    $(".page-text").each(function(){ 
        let page = parseInt($(this).text());
        $(this).text(page-1);
    });
}

function searchProduct(searchQuery) {
    $("#filter-search").val(searchQuery);
    if (searchQuery) {
        getProductsWithSearch(searchQuery, 1, pageLimit, null, null, null, createProductList);
    } else {
        let searchQuery = $('#search-input').val();
        
        getProductsWithSearch(searchQuery, 1, pageLimit, null, null, null, createProductList);
    }
}