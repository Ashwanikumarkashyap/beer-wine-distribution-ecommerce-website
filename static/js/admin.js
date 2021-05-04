let adminProducts = []
let deletedImages;
let prodIdx;

let filter = {
    "searchQuery" : "",
    "category" : "",
    "minPrice" : "",
    "maxPrice" : ""
}

$( document ).ready(function() {

    getProductsWithSearch(null, 1, pageLimit, null, null, null, createAdminList);

    $('#admin-search-input').keyup(function(event){
        var keycode = (event.keyCode ? event.keyCode : event.which);
        if(keycode == '13'){
            getAdminProducts();  
        }
    });

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
                    `<a href="#"><img class="admin-img-thumb" src="${prod.images[0]}" alt="Image"></a>` +
                    `<p>${prod.name}</p>` +
                '</div>' +
            '</td>' +
            `<td>${prod.price}</td>` +
            '<td>' +
                `${prod.stock}` +
            '</td>';

            listHtml+= `<td><button id="admin-edit-btn_${idx}" class="edit-btn"><i class="fa fa-edit"></i></button></td>`;
            if (prod.deleted) {
                // listHtml += `<td><button id="admin-edit-btn_${idx}" class="edit-btn my-disabled-btn" disabled><i class="fa fa-edit"></i></button></td>` +
                // `<td><button id="admin-del-btn_${idx}" class="my-disabled-btn" disabled><i class="fa fa-trash"></i></button></td>`;
                listHtml += `<td><button id="admin-del-btn_${idx}" class="my-disabled-btn" disabled><i class="fa fa-trash"></i></button></td>`;
            } else {
                // listHtml += `<td><button id="admin-edit-btn_${idx}" class="edit-btn"><i class="fa fa-edit"></i></button></td>` +
                // `<td><button id="admin-del-btn_${idx}" class="del-btn"><i class="fa fa-trash"></i></button></td>`;

                listHtml += `<td><button id="admin-del-btn_${idx}" class="del-btn"><i class="fa fa-trash"></i></button></td>`;
            }
        listHtml+= '</tr>';
    });

    $("#admin-table").html(listHtml);

    if (products.length ==0) {
        $("#admin-table-wrapper").hide();
        $("#cart-empty-div").show();
    } else {
        $("#admin-table-wrapper").show();
        $("#cart-empty-div").hide();
    }
    
   
    if ($('#my-pages').children().length == 0) {
    // if ($("#my-pages").html().length == 0) {
        let myPagesHtml = '';
        for (let i=0; i<3 && i <totalPages; i++) {
            if (i==0)
                myPagesHtml+=`<li onclick="getPage(this)" class="page-item active"><a class="page-link page-text" href="#">${(i+1)}</a></li>`;
            else 
                myPagesHtml+=`<li onclick="getPage(this)" class="page-item"><a class="page-link page-text" href="#">${(i+1)}</a></li>`;
        }

        if (totalPages <=3) {
            $("#next-page").addClass("disabled");
        }

        $("#my-pages").html(myPagesHtml);
    }

    if (adminProducts.length <=0) {
        $(".myadmin-page-wrapper").css("display", "none");
    } else {
        $(".myadmin-page-wrapper").css("display", "block");
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
                $("#my-pages").html("");
                getProductsWithSearch(null, 1, pageLimit, null, null, null, createAdminList);
                
            },
            error: function (error) {
                hideLoader();
                console.log('error', error);
                showErrorPopup();
            }
        })

    });

    $('.edit-btn').click(function () {

        $("#product-images-field-wrapper").html('<input id="product-images-field" class="form-control-file inputfile" type="file"' +
        'name="productImages" data-show-upload="false" data-show-caption="true" multiple>');
        prodIdx = parseInt($(this).attr('id').split("_")[1]);

        $('#product-name-field').val(adminProducts[prodIdx].name);
        $('#product-price-field').val(adminProducts[prodIdx].price);
        $('#product-qty-field').val(adminProducts[prodIdx].stock);
        $('#product-brand-field').val(adminProducts[prodIdx].brand);
        $('#product-desc-field').val(adminProducts[prodIdx].description);

        

        if (adminProducts[prodIdx].category == "beer") {
            $('#product-category-field option[value="beer"]').attr("selected",true);
            $('#product-category-field option[value="wine"]').attr("selected",false);
        } else {
            $('#product-category-field option[value="wine"]').attr("selected",true);
            $('#product-category-field option[value="beer"]').attr("selected",false);
        }

        deletedImages = new Set()
        if (adminProducts[prodIdx].images.length >0) {
        
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
        }

        $("#admin-save-btn").show();
        $("#admin-add-btn").hide();

        $('#edit-modal').modal('show');

    });



    $('#add-product-btn').click(function () {

        $("#product-images-field-wrapper").html('<input id="product-images-field" class="form-control-file inputfile" type="file"' +
        'name="productImages" data-show-upload="false" data-show-caption="true" multiple>');

        // $("admin-submit-btn").attr("onclick","addProduct()");
        // $("admin-submit-btn").text("Add Product");

        
        $('#product-name-field').val("");
        $('#product-price-field').val(50);
        $('#product-qty-field').val(1);
        $('#product-brand-field').val("");
        $('#product-desc-field').val("");
        // $('#product-category-field').val("Beer");
        $('#product-category-field option[value="beer"]').attr("selected",true);

        $("#admin-save-btn").hide();
        $("#admin-add-btn").show();

        $("#admin-image-cotainer").html("");
        $('#edit-modal').modal('show');
    });
}

function addProduct() {

    var fd = fetchFormDetails();
    if (!fd) {
        return;
    }

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
            $("#my-pages").html("");
            getProductsWithSearch(null, 1, pageLimit, null, null, null, createAdminList);
        },
        error: function (error) {
            hideLoader();
            console.log('error', error);
            showErrorPopup();
        }
    })
}

function fetchFormDetails() {

    var fd = new FormData();
    
    let brand = $('#product-brand-field').val().trim();
    let name = $('#product-name-field').val().trim();
    let price = $('#product-price-field').val().trim();
    let qty = $('#product-qty-field').val().trim();
    let desc = $('#product-desc-field').val().trim();
    let category = $('#product-category-field').val().trim();

    if (brand == "" || name == "" || price == "" || qty == "" || desc == "") {
        alert("All the required fields should be filled for signup.");
        // showErrorPopup("Missing Required Fields", "All the required fields should be filled for signup.");
        return false;
    }
   
    // get uploaded files
    var files = $('#product-images-field')[0].files;
    if(files.length > 0 ){
        for (let idx = 0; idx < files.length; idx++) {
            fd.append("files[]", files[idx]);
        }
    } else {
        if ($('#admin-image-cotainer').children().length == 0 || ($('#admin-image-cotainer').children().length !=0 && deletedImages.size == adminProducts[prodIdx].images.length)) {
            // showErrorPopup("Missing Product Image", "You must upload atleast one product image.");
            alert("You must upload atleast one product image.");
            return false;
        }   
    }

    fd.append('name', name);
    fd.append('price', price);
    fd.append('brand', brand);
    fd.append('stock', qty);
    fd.append('description', desc);
    fd.append('category', category);

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
    if (!fd) {
        return;
    }

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
            $("#my-pages").html("");
            getProductsWithSearch(null, 1, pageLimit, null, null, null, createAdminList);
            
        },
        error: function (error) {
            hideLoader();
            console.log('error', error);
            showErrorPopup();
        }
    })

}

function getPage(pageDiv) {
    let page = parseInt($(pageDiv).text());
    $('.active').removeClass("active");
    $(pageDiv).addClass("active");

    // let searchQuery = $("#admin-search-input").val();
    // if (searchQuery.trim()== "") {
    //     searchQuery = null;
    // }

    // getProductsWithSearch(searchQuery, page, pageLimit, null, null, null, createAdminList);

    filterSearch(page);
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

    // let searchQuery = $("#admin-search-input").val();
    // if (searchQuery.trim()== "") {
    //     searchQuery = null;
    // }

    // getProductsWithSearch(searchQuery, (pageNo+1), pageLimit, null, null, null, createAdminList);

    filterSearch(pageNo+1);

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

    // let searchQuery = $("#admin-search-input").val();
    // if (searchQuery.trim()== "") {
    //     searchQuery = null;
    // }
    filterSearch(pageNo-1);
    // getProductsWithSearch(searchQuery, (pageNo-1), pageLimit, null, null, null, createAdminList);

    $(".page-text").each(function(){ 
        let page = parseInt($(this).text());
        $(this).text(page-1);
    });
}

function getAdminProducts() {
    let searchQuery = $("#admin-search-input").val().trim();
    $("#filter-search").val(searchQuery);

    if (searchQuery == "") {
        searchQuery = null;
    }

    filter.searchQuery = searchQuery;
    $("#my-pages").html("");
    getProductsWithSearch(searchQuery, 1, pageLimit, null, null, null, createAdminList);
    
}

function setFilter() {
    let searchQuery = $("#filter-search").val();
    if (searchQuery.trim() == "") {
        searchQuery == null;
    }

    let cat = $("#category-input").val();
    if (cat == "Select Category") {
        cat = null;
    }

    let minPrice = $("#min-price-input").val();
    if (minPrice == "") {
        minPrice = null;
    }

    let maxPrice = $("#max-price-input").val();
    if (maxPrice == "") {
        maxPrice = null;
    }

    filter.searchQuery = searchQuery;
    filter.category = cat;
    filter.minPrice = minPrice;
    filter.maxPrice = maxPrice;
    $("#my-pages").html("");
    filterSearch(1);
}

function filterSearch(page) {
    let pageReq = 1;

    if (page) {
        pageReq = page;
    } else {
        $("#my-pages").html("");
    }

    // let searchQuery = $("#filter-search").val();
    // if (searchQuery.trim() == "") {
    //     searchQuery == null;
    // }

    // let cat = $("#category-input").val();
    // if (cat == "Select Category") {
    //     cat = null;
    // }

    // let minPrice = $("#min-price-input").val();
    // if (minPrice == "") {
    //     minPrice = null;
    // }

    // let maxPrice = $("#max-price-input").val();
    // if (maxPrice == "") {
    //     maxPrice = null;
    // }

    getProductsWithSearch(filter.searchQuery, pageReq, pageLimit, filter.category, parseInt(filter.minPrice), parseInt(filter.maxPrice), createAdminList);
}