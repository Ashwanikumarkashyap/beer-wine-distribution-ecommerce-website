let userOrders;

$( document ).ready(function() {
    // creatLoginNav();

    getOrders(createDashboard);
    applyTemplateAnimation();
});

function createDashboard(orders) {
    userOrders = orders;
    let ordersDashboardHtml = "";

    orders.forEach((order, idx) => {
        ordersDashboardHtml+=  
        '<tr>' +
            `<td>${(idx+1)}</td>`;

        if (order.customer_cart.product_ids.length == 1 ) {
            ordersDashboardHtml+= `<td>${order.customer_cart.product_ids[0].product_details.name}</td>`;
        } else {
            ordersDashboardHtml+= `<td>Multiple Products</td>`;
        }

        let orderDate = new Date(order.order_date.$date);
        ordersDashboardHtml+= `<td>${orderDate.toDateString()}</td>` +
            `<td>$${order.total_price_post_charges}</td>` +
            `<td>${order.order_status}</td>` +
            `<td><button id="view-order_${idx}" onclick="openOrderDetail(this.id)" class="btn">View</button></td>` +
        '</tr>';
    });

    $("#orders-dashboard").html(ordersDashboardHtml);
}

function getOrders(callback) {

    showLoader();
    $.ajax({
        url: '/get_orders',
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

function openOrderDetail(id) {
    let orderIdx = parseInt(id.split("_")[1]);
    $("#order-cart").html("");
    createOrderCart(userOrders[orderIdx].customer_cart);
    $('#order-detail-modal').modal('show');
}


function createOrderCart(cart) {

    let cartHtml = '';

    cart.product_ids.forEach((prod, idx) => {
        cartHtml += 
        `<tr id="cart-prod_${prod.product_id}">` +
            '<td>' +
                '<div class="img">' +
                    `<p style="margin: 0;">${prod.product_details.name}</p>` +
                '</div>' +
            '</td>' +
            `<td>$${prod.product_details.price}</td>` +
            '<td>' +
                '<div class="qty">' +
                    prod.quantity +
                    // `<input id="cart-qty_${prod.product_id}" type="text" value="${prod.quantity}">` +
                '</div>' +
            '</td>' +
            `<td>$${prod.product_details.price*prod.quantity}</td>` +
        '</tr>';
    });

    updateOrderCartSummary(cart);

    $("#order-cart").html(cartHtml);
}

function updateOrderCartSummary(cart) {
    let shipping =  Math.round(Math.min(cart.total_price*0.15, 12)*100) / 100;

    let grandTotal = Math.round((shipping + cart.total_price) * 100) / 100;
    
    $("#sub-total").text("$"+ cart.total_price);
    $("#shipping-total").text("$"+ shipping);
    $("#grand-total").text("$"+ grandTotal);
}