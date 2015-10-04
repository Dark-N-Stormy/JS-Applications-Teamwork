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
    getMessages: function(data){
        data.myId = currentUser.id;
        data.token = currentUser.token;
      socket.emit('get-messages', data);
    },
    emitPost: function(post){
        post.token = currentUser.token;
        socket.emit('save-post', post);
    },
    changeAvatar:function(url){
        console.log('will send avatar');
      socket.emit('change-avatar', {
          token:currentUser.token,
          url:url,
          id:currentUser.id
      })
    },
    registerSocketListeners: function() {
        socket.on('hello-client', function (msg) {
            console.log(msg);
        });

        socket.on('message', function (data) {
            chatHandler.receivedMessage(data);
        });

        //socket.on('unread',function(data){
        //   for(var i=0;i<data.length;i+=1){
        //       chatHandler.unread(data[i])
        //   }
        //});

        socket.on('force-disconnect',function(data){
            alert(data);
        });

        socket.on('old-messages', function(data){
            console.log('old-messages',data);
            chatHandler.loadMessages(data);
        });
    }
});

var socketHandler = new SocketHandler();