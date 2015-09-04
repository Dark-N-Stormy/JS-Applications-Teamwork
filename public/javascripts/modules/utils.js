var Utils = Class.extend({
    init: function () {
        var that = this;

        $('#loginModal form').on('submit', function(e) {
            e.preventDefault();
            that.login(e.target);
        });

        $('#registerModal form').on('submit', function(e) {
            e.preventDefault();
            that.register(e.target);
        });

        $('.btn-avatar').on('click', function(){
            socketHandler.changeAvatar($('.input-avatar').val());
        });

        $('.input-avatar').on('keyup', function(e){
            if(e.which===13){
                e.preventDefault();
                e.stopPropagation();
                socketHandler.changeAvatar($('.input-avatar').val())
            }
        });

        $('#avatarModal').on('submit', function(e){
            e.preventDefault();
        });
    },
    displayMessage: function (message, type) {
        console.log(message);
    },
    login: function (form) {
        var that = this,
            form = $(form),
            username = form.find('input[name="username"]').val(),
            password = form.find('input[name="password"]').val();

        $('.login-error').detach();
        form.find('.spinner').show();

        $.ajax({
            url: window.location.origin + '/login',
            data: {
                username:username,
                password:password
            },
            method: 'POST',
            success: function(data) {
                if(data.error) {
                    form.find('.spinner').hide();
                    that.addError(form,data.errorMessage,'login-error');
                } else {
                    window.location.reload();
                }
            }
        });
    },
    register: function (form) {
        var that = this,
            form = $(form),
            username = form.find('input[name="username"]').val().toLowerCase(),
            password = form.find('input[name="password"]').val(),
            passwordRepeat = form.find('input[name="password-repeat"]').val();

        $('.register-error').detach();

        if(password ===  passwordRepeat && /^[A-z0-9]+$/.test(username) && username.length > 4 && password.length >5 ){
            form.find('.spinner').show();

            $.ajax({
                url: window.location.origin + '/register',
                data: {
                    username:username,
                    password:password
                },
                method: 'POST',
                success: function(data) {
                    if(data.error) {
                        form.find('.spinner').hide();
                        that.addError(form,data.errorMessage,'register-error');
                    } else {
                        window.location.reload();
                    }
                }
            });
        } else if(password !== passwordRepeat){
            that.addError(form,'Repeated password does not macth.','register-error');
        } else if(username.length < 5) {
            that.addError(form,'Username must be at least 5 symbols','register-error');
        }  else if(password.length < 6) {
            that.addError(form,'Password must be at least 6 symbols','register-error');
        } else if(!/^[A-z][A-zs0-9-]+$/.test(username)) {
            that.addError(form,'Username must contain only letters, digits and dashes and must start with a letter','register-error');
        }
    },
    addError: function(form, errorMessage, className) {
        console.log(form, errorMessage,className);
        var className = className || 'login-error',
            errorDiv = $('<div/>')
            .addClass(className)
            .text(errorMessage);
        form.closest('.modal-content').append(errorDiv);
        $('.'+className).slideDown();
    }
});

var utils = new Utils();