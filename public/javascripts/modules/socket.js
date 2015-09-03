//frontend javascript for sockets
console.log('frontend javascript for sockets');
var socket, io;

var SocketHandler = Class.extend({
    init: function () {
        var self = this;

        System.import('/socket.io/socket.io.js')
            .then(function (ioLoaded) {
                io = ioLoaded;

                socket = io(window.location.origin);

                if(currentUser){
                    console.log('registering me',currentUser);
                    socket.emit('register-socket',{
                        id:currentUser.id,
                        token:currentUser.token
                    });
                }

                self.registerSocketListeners();
            });
    },
    sendTest: function () {
        console.log('emitting test to server');
        var data ={
            token:currentUser.token
        };
        socket.emit('hello-server', data);
    },
    sendMessage: function (message,receiverId) {
        console.log('emitting message to server');
        var messageData = {
            token:currentUser.token,
            message:message,
            sender:currentUser.id,
            receiver: receiverId
        };
        socket.emit('message',messageData);
    },
    sendSeenAll:function(data){
        console.log('will send unseen');
        data.token = currentUser.token;
        socket.emit('seen-all',data);
    },
    registerSocketListeners: function() {
        socket.on('hello-client', function (msg) {
            console.log(msg);
        });

        socket.on('message', function (data) {
            console.log(data);
            chatHandler.receivedMessage(data);
        });

        socket.on('unread',function(data){
            console.log('got unread messages');
           for(var i=0;i<data.length;i+=1){
               chatHandler.unread(data[i])
           }
        });

        //socket.on('disconnect',function(data){
        //    if(data){
        //        window.location.href =  window.location.origin;
        //    }
        //});

        socket.on('force-disconnect',function(data){
            alert(data);
        });
    }
});

var socketHandler = new SocketHandler();