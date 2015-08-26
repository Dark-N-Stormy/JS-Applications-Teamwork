function ioHandler(io){
    io.on('connection', function (client) {
        client.on('hello-server', function (data) {
            console.log('Client said hello');
            client.emit('hello-client', 'hello');
        });

        client.on('message',function(data){
           console.log('client send message',data);
            client.broadcast.emit('message',data);
        });
    });
}

module.exports=ioHandler;