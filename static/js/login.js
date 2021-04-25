$( document ).ready(function() {
    // creatLoginNav();

    // should be called after creating every UI elements
    applyTemplateAnimation();
});

function register() {
    let uname = $("#reg-uname-input").val();
    let fname = $("#reg-fname-input").val();
    let email = $("#reg-email-input").val();
    let mobile = $("#reg-contactno-input").val();
    let pw = $("#reg-pw-input").val();
    let pwconf = $("#reg-pwconf-input").val();
    let govtId = $("#reg-govtid-input").val();

    if (pw != pwconf) {
        alert("Both the passwords should match.");
        return;
    }

    if (!isStrongPwd(pw)) {
        alert('Password is not strong enough. Password should contain the following:\n' +
        'i) Password should have at least 8 characters.' +
        'ii) At least one upper case letter (A – Z).\n' +
        'iii) At least one lower case letter(a-z).\n' +
        'iv) At least one digit (0 – 9).\n' +
        'v) At least one special Characters of !@#$%&*()')
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
            console.log('error', error);
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
            console.log('error', error);
        }
    })

    
}