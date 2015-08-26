//frontend javascript for sockets
console.log('frontend javascript for sockets');
var socket,io;

System.import('/socket.io/socket.io.js')
    .then(function(ioLoaded){
        io = ioLoaded;
        socket=io(window.location.origin);
        registerSocketListeners();
    });

var socketSendHandler = {
    sendTest:function(){
        console.log('emitting test to server');
        socket.emit('hello-server','something');
    },
    sendMessage:function(message){
        console.log('emitting message to server');
        socket.emit('message',message);
    }
};

function registerSocketListeners(){
    socket.on('hello-client',function(msg){
        console.log(msg)
    });

    socket.on('message',function(data){
        recievedMessage(data);
    });
}