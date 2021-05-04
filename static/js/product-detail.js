let product;
let slideIndex = 1;

let isAddedToCart = false;

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
    $("#prod-detail-stock").html("Stock: " + product.stock);
    $("#product-desc").html(product.description);
    
    createProductDetailSliders(myProduct);
}

function attachListeners() {
    $( "#prod-detail-cart-btn" ).click(function() {
        let qty = parseInt($('#prod-detail-cart-qty').val());
        addToCart(product._id.$oid, qty, true, ()=> {
            isAddedToCart = true;
        });
    });

    $( "#prod-detail-buy-btn" ).click(function() {
        if (isAddedToCart) {
            goToCartPage();
        } else {
            let qty = parseInt($('#prod-detail-cart-qty').val());
            addToCart(product._id.$oid, qty, true, goToCartPage);
        }
    });
}


function incProdQty () {
    let qty = parseInt($('#prod-detail-cart-qty').val());
    if (qty < product.stock) {
        $('#prod-detail-cart-qty').val(qty+1);
    }
}

function decProdQty () {
    let qty = parseInt($('#prod-detail-cart-qty').val());
    if (qty > 1) {
        $('#prod-detail-cart-qty').val(qty-1);
    }
}

function createProductDetailSliders(myProduct) {
    let sliderHtml = "";
    myProduct.images.forEach(imgSrc => {
        sliderHtml+= ` <div class="mySlides"><img class="image-detail-slide-img" src="${imgSrc}"></div>`;
    });

    $("#product-detail-slider-imgs").html(sliderHtml);
    showDivs(slideIndex);
}

function plusDivs(n) {
  showDivs(slideIndex += n);
}

function currentDiv(n) {
  showDivs(slideIndex = n);
}

function showDivs(n) {
  var i;
  var x = document.getElementsByClassName("mySlides");
  var dots = document.getElementsByClassName("demo");
  if (n > x.length) {slideIndex = 1}    
  if (n < 1) {slideIndex = x.length}
  for (i = 0; i < x.length; i++) {
    x[i].style.display = "none";  
  }
  for (i = 0; i < dots.length; i++) {
    dots[i].className = dots[i].className.replace(" w3-red", "");
  }
  x[slideIndex-1].style.display = "flex";  
}