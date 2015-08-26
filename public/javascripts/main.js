console.log('Main js loaded');

System.import('/bower_components/jquery/dist/jquery.min.js')
    .then(function(){
        System.import('/bower_components/bootstrap/dist/js/bootstrap.min.js')
            .then(function(){
                System.config({
                    baseURL: '/javascripts/modules'
                });

                System.import('socket.js');
                System.import('feed.js');
                System.import('chat.js');
            })
    });




