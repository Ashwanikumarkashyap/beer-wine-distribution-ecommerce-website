$( document ).ready(function() {
    
    // creatLoginNav();

    creatHomeSlider(sliderData);
    getProductsWithSearch(null, 1, pageLimit, null, null, null, createFeaturedPanel);

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
                    `<a id="name-${data._id.$oid}" href="#">${data.name}</a>` + 
                '</div>' +
                '<div class="product-image">' +
                    '<a href="product-detail.html">' +
                        `<img src="${data.images[0]}" alt="Product Image">` +
                    '</a>' +
                    '<div class="product-action">' +
                        `<a id="cart-${data._id.$oid}" onclick="return addToCart(this.id, 1, false)" href="#"><i class="fa fa-cart-plus"></i></a>` +
                        // `<a id="favourite-${data.id}" onclick="return addToFav(this.id)" href="#"><i class="fa fa-heart"></i></a>` +
                        `<a id="detail-${data._id.$oid}" onclick="return getProdDetail(this.id)"><i class="fa fa-search"></i></a>` +
                    '</div>' +
                '</div>' +
                '<div class="product-price">' +
                    `<h3><span>$</span>${data.price}</h3>` +
                    `<a id="cart-${data._id.$oid}" class="btn" onclick="return addToCart(this.id, 1, false, goToCartPage)" href=""><i class="fa fa-shopping-cart"></i>Buy Now</a>` +
                '</div>' +
            '</div>' +
        '</div>'
    })
    featueredPanel.append(featueredHtml)

    // should be called after creating every UI elements
    applyTemplateAnimation();
}



function creatHomeSlider(sliderData) {
    let sliderHtml = '';
    let sliderDiv = $('#home-slider')
    sliderData.forEach((data)=> {
        sliderHtml+= '<div class="header-slider-item">' + 
            `<img class="home-slider-img" src="../static/img/${data}" alt="Slider Image" />` + 
                '<div class="header-slider-caption">' + 
                    '<p>Shop wines, beers, & spirits at the best prices, selection, & service</p>' + 
                    '<a class="btn" href="/products"><i class="fa fa-shopping-cart"></i>Shop Now</a>' + 
                '</div>' + 
        '</div>'
    })
    sliderDiv.append(sliderHtml)
}