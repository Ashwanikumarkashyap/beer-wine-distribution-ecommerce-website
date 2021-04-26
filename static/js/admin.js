let adminProducts = []

$( document ).ready(function() {

    getProducts(1, pageLimit, null, null, null, createAdminList);

    // should be called after creating every UI elements
    applyTemplateAnimation();
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
                getProducts(1, pageLimit, null, null, null, createAdminList);
                
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
        cache: false,
        contentType: false,
        processData: false,
        data: fd,
        success: function (response) {
            console.log("success\n", response);
            hideLoader();
            $('#edit-modal').modal('hide');
            getProducts(1, pageLimit, null, null, null, createAdminList);
        },
        error: function (error) {
            hideLoader();
            console.log('error', error);
        }
    })
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
            getProducts(1, pageLimit, null, null, null, createAdminList);
            
        },
        error: function (error) {
            hideLoader();
            console.log('error', error);
        }
    })

}

function getPage(pageDiv) {
    let page = parseInt($(pageDiv).text());
    $('.active').removeClass("active");
    $(pageDiv).addClass("active");
    getProducts(page, pageLimit, null, null, null, createAdminList);
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

    getProducts((pageNo+1), pageLimit, null, null, null, createAdminList);

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

    getProducts((pageNo-1), pageLimit, null, null, null, createAdminList);

    $(".page-text").each(function(){ 
        let page = parseInt($(this).text());
        $(this).text(page-1);
    });
}