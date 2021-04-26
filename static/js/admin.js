let adminProducts = []
let deletedImages;

$( document ).ready(function() {

    getProductsWithSearch(null, 1, pageLimit, null, null, null, createAdminList);

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
                getProductsWithSearch(null, 1, pageLimit, null, null, null, createAdminList);
                
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

        // $("admin-submit-btn").attr("onclick","editProduct()");
        // $("admin-submit-btn").text("Save Changes");

        let imageViewerHtml = '<label id="photo-viewer-label" class="control-label">Current Photos</label><div id="admin-image-wrapper">';
        adminProducts[prodIdx].images.forEach((imgSrc, idx) => {
            imageViewerHtml+= 
            '<div class="admin-img-div">' +
                `<button id="admin-img-del_${idx}" class="btn admin-img-trash"><i class="fa fa-trash"></i></button>` +
                `<button id="admin-img-restore_${idx}" class="btn admin-img-restore"><i class="fa fa-trash-restore"></i></button>` +
                `<img id="admin-img_${idx}" class="admin-img" src="${imgSrc}">` +
            '</div>';
        });
        imageViewerHtml+= '</div>';

        $("#admin-image-cotainer").html(imageViewerHtml);

        deletedImages = new Set()
        
        $( ".admin-img-restore" ).click(function( event ) {
            let id = $(this).attr('id').split('_')[1];
            $("#admin-img_" + id).css("filter", "none");
            $("#admin-img-del_" + id).css("display", "block");
            $(this).css("display", "none");

            // remove image from deleted set
            deletedImages.delete(id);
        });

        $( ".admin-img-trash" ).click(function( event ) {
            let id = $(this).attr('id').split('_')[1];
            $("#admin-img_" + id).css("filter", "grayscale(1)");
            $("#admin-img-restore_" + id).css("display", "block");
            $(this).css("display", "none");

            // add image to deleted set
            deletedImages.add(id);
        });

        $(".admin-img-trash-restore").css("display", "none");

        $("#admin-save-btn").show();
        $("#admin-add-btn").hide();

        $('#edit-modal').modal('show');

    });



    $('#add-product-btn').click(function () {

        // $("admin-submit-btn").attr("onclick","addProduct()");
        // $("admin-submit-btn").text("Add Product");

        
        $('#product-name-field').val("");
        $('#product-price-field').val(50);
        $('#product-qty-field').val(1);
        $('#product-brand-field').val("");
        $('#product-desc-field').val("");
        $('#product-category-field').val("Bear");

        $("#admin-save-btn").hide();
        $("#admin-add-btn").show();

        $("#admin-image-cotainer").html("");
        $('#edit-modal').modal('show');
    });
}

function addProduct() {

    var fd = fetchFormDetails();

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
            getProductsWithSearch(null, 1, pageLimit, null, null, null, createAdminList);
        },
        error: function (error) {
            hideLoader();
            console.log('error', error);
        }
    })
}

function fetchFormDetails() {

    var fd = new FormData();
    
    let brand = $('#product-brand-field').val();
    let name = $('#product-name-field').val();
    let price = $('#product-price-field').val();
    let qty = $('#product-qty-field').val();
    let desc = $('#product-desc-field').val();
    let category = $('#product-category-field').val();
    
    fd.append('name', name);
    fd.append('price', price);
    fd.append('brand', brand);
    fd.append('stock', qty);
    fd.append('description', desc);
    fd.append('category', category);

    // get uploaded files
    var files = $('#product-images-field')[0].files;
    if(files.length > 0 ){
        for (let idx = 0; idx < files.length; idx++) {
            fd.append("files[]", files[idx]);
        }
    }

    return fd;
}

// function editProduct() {

//     prodReq = fetchFormDetails();
//     prodReq.product_id = adminProducts[prodIdx]._id.$oid;

//     showLoader();
//     $.ajax({
//         type: "PUT",
//         url: "/update_product_details",
//         contentType: 'application/json; charset=utf-8',
//         dataType: 'json',
//         data: JSON.stringify(prodReq),
//         success: function (response) {
//             hideLoader();
//             console.log("success\n", response);
//             $('#edit-modal').modal('hide');
//             getProductsWithSearch(null, 1, pageLimit, null, null, null, createAdminList);
            
//         },
//         error: function (error) {
//             hideLoader();
//             console.log('error', error);
//         }
//     })

// }

function editProduct() {

    fd = fetchFormDetails();
    fd.append('product_id', adminProducts[prodIdx]._id.$oid);
    
    // add images to be deleted from the server
    let deletedImagesReq = []
    for (let imageIdx of deletedImages) 
        deletedImagesReq.push(adminProducts[prodIdx].images[imageIdx])

    fd.append('deleted_images', deletedImagesReq);

    showLoader();
    $.ajax({
        type: "PUT",
        url: "/update_product_details",
        cache: false,
        contentType: false,
        processData: false,
        data: fd,
        success: function (response) {
            hideLoader();
            console.log("success\n", response);
            $('#edit-modal').modal('hide');
            getProductsWithSearch(null, 1, pageLimit, null, null, null, createAdminList);
            
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
    getProductsWithSearch(null, page, pageLimit, null, null, null, createAdminList);
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

    getProductsWithSearch(null, (pageNo+1), pageLimit, null, null, null, createAdminList);

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

    getProductsWithSearch(null, (pageNo-1), pageLimit, null, null, null, createAdminList);

    $(".page-text").each(function(){ 
        let page = parseInt($(this).text());
        $(this).text(page-1);
    });
}