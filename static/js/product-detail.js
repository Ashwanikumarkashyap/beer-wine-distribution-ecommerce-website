let product;

$( document ).ready(function() {
    // creatLoginNav();
    attachListeners();
    // should be called after creating every UI elements
    applyTemplateAnimation();
});

function updateProductDetail(myProduct) {
    product = myProduct
    console.log(product);
    $("#prod-detail-name").html(product.name);
    $("#prod-detail-price").html("$" + product.price);
}

function attachListeners() {
    $( "#prod-detail-cart-btn" ).click(function() {
        let qty = parseInt($('#prod-detail-cart-qty').val());
        addToCart(product._id.$oid, qty, true);
    });
}