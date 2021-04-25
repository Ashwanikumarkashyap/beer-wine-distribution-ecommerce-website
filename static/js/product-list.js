$( document ).ready(function() {

    // creatLoginNav();


    // getProducts(null, null, null, createProductList);
    getProducts1(1, 12, null, null, null, createProductList);
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
}