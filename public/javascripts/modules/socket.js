//frontend javascript for sockets
console.log('frontend javascript for sockets');
var socket, io;

var SocketHandler = Class.extend({
    init: function () {
        var self = this;

        System.import('/socket.io/socket.io.js')
            .then(function (ioLoaded) {
                io = ioLoaded;

                if(currentUser) {
                    query = "username="+currentUser.username +'&id='+currentUser.id
                } else {
                    query = "username="+currentUser.username +'&id='+currentUser.id;
                }

                socket = io(window.location.origin,{ query: query});

                self.registerSocketListeners();
            });
    },
    sendTest: function () {
        console.log('emitting test to server');
        socket.emit('hello-server', 'something');
    },
    sendMessage: function (message,receiverId) {
        console.log('emitting message to server');
        var messageData = {
            message:message,
            sender:currentUser.id,
            receiver: receiverId
        };
        socket.emit('message',messageData);
    },
    registerSocketListeners: function() {
        socket.on('hello-client', function (msg) {
            console.log(msg)
        });

        socket.on('message', function (data) {
            console.log(data);
            chatHandler.receivedMessage(data);
        });

        socket.on('disconnect',function(data){
            if(data){
                window.location.href =  window.location.origin;
            }
        });
    }
});

var socketHandler = new SocketHandler();