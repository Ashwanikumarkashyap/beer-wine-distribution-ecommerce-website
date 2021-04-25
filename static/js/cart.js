$( document ).ready(function() {
    // creatLoginNav();

    getCart(createCart);

    // should be called after creating every UI elements
    applyTemplateAnimation();
});

function getCart(callback) {

    showLoader();
    $.ajax({
        url: '/get_cart',
        type: 'GET',
        dataType: "json",
        success: function (response) {
            hideLoader();
            console.log('success\n', response)
            // if (callback)
                // callback(response);
        },
        error: function (error) {
            hideLoader();
            console.log(error);
        }
    })
}

function createCart(products) {

    let cartHtml = '';

    products.forEach(prod => {
        cartHtml += 
        '<tr>' +
            '<td>' +
                '<div class="img">' +
                    `<a href="#"><img src="${prod.images[0]}" alt="Image"></a>` +
                    `<p>${prod.name}</p>`
                '</div>' +
            '</td>' +
            `<td>$${prod.price}</td>` +
            '<td>' +
                '<div class="qty">' +
                    '<button class="btn-minus"><i class="fa fa-minus"></i></button>' +
                    `<input type="text" value="1">` +
                    '<button class="btn-plus"><i class="fa fa-plus"></i></button>' +
                '</div>' +
            '</td>' +
            `<td>$${prod.total}}</td>` +
            '<td><button><i class="fa fa-trash"></i></button></td>' +
        '</tr>'

    });

    $("#my-cart").html(cartHtml);
}