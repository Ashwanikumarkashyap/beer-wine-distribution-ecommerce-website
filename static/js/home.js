$( document ).ready(function() {
    
    // creatLoginNav();

    creatHomeSlider(sliderData);
    createFeaturedPanel(products);

    // should be called after creating every UI elements
    applyTemplateAnimation();
});

function createFeaturedPanel(featueredData) {
    let featueredHtml = '';
    
    let featueredPanel = $('#featured-panel')
   
    
    featueredData.forEach((data, idx)=> {
        if (idx > 4) {
            return;
        }
        featueredHtml+= '<div class="col-lg-3">' + 
            '<div class="product-item">' +
                '<div class="product-title">' + 
                    `<a id="name-${data.id}" href="#">${data.productName}</a>` + 
                '</div>' +
                '<div class="product-image">' +
                    '<a href="product-detail.html">' +
                        `<img src="${data.productImage}" alt="Product Image">` +
                    '</a>' +
                    '<div class="product-action">' +
                        `<a id="cart-${data.id}" onclick="return addtoCart(this.id, 1, false)" href="#"><i class="fa fa-cart-plus"></i></a>` +
                        // `<a id="favourite-${data.id}" onclick="return addToFav(this.id)" href="#"><i class="fa fa-heart"></i></a>` +
                        `<a id="detail-${data.id}" href="product-detail.html"><i class="fa fa-search"></i></a>` +
                    '</div>' +
                '</div>' +
                '<div class="product-price">' +
                    `<h3><span>$</span>${data.productPrice}</h3>` +
                    `<a id="cart-${data.id}" class="btn" href=""><i class="fa fa-shopping-cart"></i>Buy Now</a>` +
                '</div>' +
            '</div>' +
        '</div>'
    })
    featueredPanel.append(featueredHtml)
}

function creatHomeSlider(sliderData) {
    let sliderHtml = '';
    let sliderDiv = $('#home-slider')
    sliderData.forEach((data)=> {
        sliderHtml+= '<div class="header-slider-item">' + 
            `<img src="../static/img/${data}" alt="Slider Image" />` + 
                '<div class="header-slider-caption">' + 
                    '<p>Some text goes here that describes the image</p>' + 
                    '<a class="btn" href=""><i class="fa fa-shopping-cart"></i>Shop Now</a>' + 
                '</div>' + 
        '</div>'
    })
    sliderDiv.append(sliderHtml)
}