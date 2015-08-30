var messageHandler = require('./data/message');

function ioHandler(io, activeUsers) {

    io.on('connection', function (client) {
        var clientUsername = client.request._query['username'];
        var clientId = client.request._query['id'];

        //console.log((clientUsername)?'y':'n');
        //console.log((clientUsername!=='undefined')?'y':'n');
        //console.log((clientId)?'y':'n');
        //console.log((clientId !=='undefined')?'y':'n');
        //console.log((!userExists(client,activeUsers,clientUsername))?'y':'n');
        if (clientUsername && clientUsername !== 'undefined'
                && clientId && clientId !== 'undefined'
                && !userExists(client, activeUsers, clientUsername)) {
            activeUsers.push({
                socket: client,
                username: clientUsername,
                id: clientId
            });

            console.log(activeUsers);
        }

        client.on('disconnect', function () {
            for (var i = 0; i < activeUsers.length; i += 1) {
                if (activeUsers[i].socket === client) {
                    console.log(activeUsers[i].username + ' left');
                    activeUsers.splice(i, 1);
                }
            }
        });

        client.on('hello-server', function (data) {
            console.log('Client said hello');
            client.emit('hello-client', 'hello');
        });

        client.on('message', function (data) {
            if (checkUserSocket(data.sender,client, activeUsers)) {
                for (var i = 0; i < activeUsers.length; i += 1) {
                    if (activeUsers[i].id === data.receiver) {
                        messageHandler.saveMessage(data);
                        activeUsers[i].socket.send(data);
                    }
                }
            } else {
                client.disconnect();
            }
        });
    });
}

module.exports = ioHandler;

function userExists(socket, activeUsers, username) {
    for (var i = 0; i < activeUsers.length; i+=1) {
        if (activeUsers[i].socket === socket) {
            return true;
        }
    }

    return false;
}

function checkUserSocket(senderId, socket,activeUsers){
    for(var i=0;i<activeUsers.length; i+=1) {
        if(activeUsers[i].id === senderId && activeUsers[i].socket === socket) {
            return true;
        }
    }

    return false;
}