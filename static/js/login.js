$( document ).ready(function() {
    // creatLoginNav();

    // should be called after creating every UI elements
    applyTemplateAnimation();
});

function register() {
    let uname = $("#reg-uname-input").val().trim() ;
    let fname = $("#reg-fname-input").val().trim();
    let email = $("#reg-email-input").val().trim();
    let mobile = $("#reg-contactno-input").val().trim();
    let pw = $("#reg-pw-input").val().trim();
    let pwconf = $("#reg-pwconf-input").val().trim();
    let govtId = $("#reg-govtid-input").val().trim();

    let emailValRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    var emailCheck = new RegExp(emailValRegex);

    if (uname=="" || fname== "" || mobile == "" || email == "" || govtId == "" || pw == "" || pwconf == "") {
        showErrorPopup("Missing Required Fields", "All the required fields should be filled for signup.");
        return false;
    }

    if (!emailCheck.test(email)) { 
        showErrorPopup("Invalid Email Address", "Please Enter a valid Email Adresss.");
        return false;
    }

    if (mobile.trim().length!=10 || parseInt(mobile.trim()) <=0) { 
        showErrorPopup("Invalid Phone Number", "Please Enter a valid phone number.");
        return false;
    }


    if (pw != pwconf) {
        showErrorPopup("Passwords Mismatch", "Both the password values should match.");
        return;
    }

    if (!isStrongPwd(pw)) {
        showErrorPopup("Passwords is not strong enough", 'Password is not strong enough. Password should contain the following:<br>' +
        'i) Password should have at least 8 characters.<br>' +
        'ii) At least one upper case letter (A – Z).<br>' +
        'iii) At least one lower case letter(a-z).<br>' +
        'iv) At least one digit (0 – 9).<br>' +
        'v) At least one special Characters of !@#$%&*()');
        return;
    }

    var request = { 
        "user_name": uname, 
        "full_name": fname, 
        "email_id": email, 
        "password" : pw,
        "address" : "",
        "govt_id" : govtId,
        "contact_no" : mobile,
    };

    
    showLoader();
    $.ajax({
        type: "POST",
        url: "/val_sign_up",
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        data: JSON.stringify(request),
        success: function (response) {
            hideLoader();
            console.log('success');
            window.location.href = "/";
        },
        error: function (error) {
            hideLoader();
            console.log('error\n', error);
            let errMessage = null;
            if (error.responseJSON.message) {
                errMessage = error.responseJSON.message;
            }
            showErrorPopup(null, errMessage);
        }
    })
}

function isStrongPwd(password) {
 
    var regExp = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%&*()]).{8,}/;

    var validPassword = regExp.test(password);

    return validPassword;
}


function login() {
    let uname = $("#login-uname-input").val();
    let pw = $("#login-pw-input").val();
    let isAdmin = document.getElementById("login-isadmin-input").checked;

    if (uname.trim() == "" || pw.trim() == "") {
        showErrorPopup("Missing Required Fields", "All the required fields should be filled for login.")
        return;
    }

    var request = { 
        "user_name": uname, 
        "password": pw,
        "is_admin": isAdmin,
    };
    showLoader();
    $.ajax({
        type: "POST",
        url: "/val_sign_in",
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        data: JSON.stringify(request),
        success: function (response) {
            hideLoader();
            console.log('success');
            if (isAdmin) {
                window.location.href = "/admin";
            } else {
                window.location.href = "/";
            }
        },
        error: function (error) {
            hideLoader();
            console.log('error\n', error);
            showErrorPopup(null, error.responseJSON.message);
        }
    })

    
}