let adminProducts = []

$( document ).ready(function() {

    

    // should be called after creating every UI elements
    applyTemplateAnimation();
    attachListeners();

    // getProducts1(1, 15, null, null, null, createAdminList);
});

function createAdminList(products) {
    adminProducts = products;
    let listHtml = '';

    products.forEach((prod, idx) => {
        listHtml += 
        '<tr>' +
            '<td>' +
                '<div class="img">' +
                    `<p>${prod.name}</p>` +
                '</div>' +
            '</td>' +
            `<td>${prod.price}</td>` +
            '<td>' +
                `${prod.stock}` +
            '</td>';

            if (prod.deleted) {
                listHtml += `<td><button id="admin-edit-btn_${idx}" class="edit-btn my-disabled-btn" disabled><i class="fa fa-edit"></i></button></td>` +
                `<td><button id="admin-del-btn_${idx}" class="my-disabled-btn" disabled><i class="fa fa-trash"></i></button></td>`;
            } else {
                listHtml += `<td><button id="admin-edit-btn_${idx}" class="edit-btn"><i class="fa fa-edit"></i></button></td>` +
                `<td><button id="admin-del-btn_${idx}" class="del-btn"><i class="fa fa-trash"></i></button></td>`;
            }
        listHtml+= '</tr>';
    });

    $("#admin-table").html(listHtml);
    attachListeners();
    
}

function attachListeners() {
    $('.del-btn').click(function () {

        prodIdx = parseInt($(this).attr('id').split("_")[1]);
        prodReq = {
            "product_id" : adminProducts[prodIdx]._id.$oid
        }

        $.ajax({
            type: "DELETE",
            url: "/rem_from_products" + '?' + $.param(prodReq),
            dataType: "json",
            success: function (response) {
                console.log("success\n", response);
                getProducts(null, null, null, createAdminList);
                
            },
            error: function (error) {
                hideLoader();
                console.log('error', error);
            }
        })

    });

    $('.edit-btn').click(function () {

        prodIdx = parseInt($(this).attr('id').split("_")[1]);

        $('#product-name-field').val(adminProducts[prodIdx].name);
        $('#product-price-field').val(adminProducts[prodIdx].price);
        $('#product-qty-field').val(adminProducts[prodIdx].stock);
        $('#product-brand-field').val(adminProducts[prodIdx].brand);
        $('#product-desc-field').val(adminProducts[prodIdx].description);
        $('#product-category-field').val(adminProducts[prodIdx].category);


        $("admin-submit-btn").attr("onclick","editProduct()");
        $("admin-submit-btn").text("Save Changes");

        $("#admin-save-btn").show();
        $("#admin-add-btn").hide();

        $('#edit-modal').modal('show');

    });



    $('#add-product-btn').click(function () {

        $("admin-submit-btn").attr("onclick","addProduct()");
        $("admin-submit-btn").text("Add Product");

        
        $('#product-name-field').val("");
        $('#product-price-field').val(50);
        $('#product-qty-field').val(1);
        $('#product-brand-field').val("");
        $('#product-desc-field').val("");
        $('#product-category-field').val("Bear");

        $("#admin-save-btn").hide();
        $("#admin-add-btn").show();

        $('#edit-modal').modal('show');
    });
}

function addProduct() {

    let prodReq = fetchFormDetails();
    var fd = getFiles();

    fd.append('name', prodReq.name);
    fd.append('price', prodReq.price);
    fd.append('brand', prodReq.brand);
    fd.append('stock', prodReq.stock);
    fd.append('description', prodReq.description);
    fd.append('category', prodReq.category);

    showLoader();

    $.ajax({
        type: "POST",
        url: "/add_to_products",
        // contentType: 'application/json; charset=utf-8',
        cache: false,
        contentType: false,
        processData: false,
        data: fd,
        success: function (response) {
            console.log("success\n", response);
            hideLoader();
            $('#edit-modal').modal('hide');
            getProducts(null, null, null, createAdminList);
        },
        error: function (error) {
            hideLoader();
            console.log('error', error);
        }
    })

    // $.ajax({
    //     type: "POST",
    //     url: "/add_to_products",
    //     contentType: 'application/json; charset=utf-8',
    //     dataType: 'json',
    //     data: JSON.stringify(prodReq),
    //     success: function (response) {
    //         console.log("success\n", response);
    //         hideLoader();
    //         $('#edit-modal').modal('hide');
    //         getProducts(null, null, null, createAdminList);
    //     },
    //     error: function (error) {
    //         hideLoader();
    //         console.log('error', error);
    //     }
    // })

}


function getFiles() {
    var fd = new FormData();
    var files = $('#product-images-field')[0].files;
    
    // Check file selected or not
    if(files.length > 0 ){
        for (let idx = 0; idx < files.length; idx++) {
            fd.append("files[]", files[idx]);
        }
    }

    return fd;
    //     $.ajax({
    //         url: 'upload.php',
    //         type: 'post',
    //         data: fd,
    //         contentType: false,
    //         processData: false,
    //         success: function(response){
    //             if(response != 0){
    //             $("#img").attr("src",response); 
    //             $(".preview img").show(); // Display image element
    //             }else{
    //             alert('file not uploaded');
    //             }
    //         },
    //     });
    // }else{
    //     alert("Please select a file.");
    // }
}

function fetchFormDetails() {
    let brand = $('#product-brand-field').val();
    let name = $('#product-name-field').val();
    let price = $('#product-price-field').val();
    let qty = $('#product-qty-field').val();
    let desc = $('#product-desc-field').val();
    let category = $('#product-category-field').val();

    let images = ["../static/img/product-1.jpg", 
            "../static/img/product-2.jpg", 
            "../static/img/product-3.jpg",
            "../static/img/product-4.jpg",
            "../static/img/product-5.jpg" ];
    
    let prodReq = {
        'name': name,
        'price': price,
        'brand': brand,
        'stock': qty,
        'description': desc,
        'category': category,
        'images': images,
    }

    return prodReq;
}

function editProduct() {

    prodReq = fetchFormDetails();
    prodReq.product_id = adminProducts[prodIdx]._id.$oid;

    showLoader();
    $.ajax({
        type: "PUT",
        url: "/update_product_details",
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        data: JSON.stringify(prodReq),
        success: function (response) {
            hideLoader();
            console.log("success\n", response);
            $('#edit-modal').modal('hide');
            getProducts(null, null, null, createAdminList);
            
        },
        error: function (error) {
            hideLoader();
            console.log('error', error);
        }
    })

}
