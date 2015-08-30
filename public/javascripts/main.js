console.log('Main js loaded');
var currentUser =  currentUser || false;
System.import('/bower_components/jquery/dist/jquery.min.js')
    .then(function () {
        System.import('/bower_components/bootstrap/dist/js/bootstrap.min.js')
            .then(function () {

                System.import('javascripts/Class.js')
                    .then(function () {
                        System.import('javascripts/modules/socket.js');
                        System.import('javascripts/modules/feed.js');
                        System.import('javascripts/modules/chat.js');
                        System.import('javascripts/modules/utils.js');
                    });

            });

        System.import('/bower_components/malihu-custom-scrollbar-plugin/jquery.mCustomScrollbar.concat.min.js');
    });




