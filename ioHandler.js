var messageHandler = require('./data/message');
var postsHandler = require('./data/posts');
var userHandler = require('./data/user');

function ioHandler(io, activeUsers) {

    io.on('connection', function (client) {
        client.on('register-socket',function(data){

            var userId = data.id,
                token = data.token,
                tokenFound = false;

            if(userId && token){
                //console.log('got user & id for register',userId,token);
                for(var i=0;i<activeUsers.length;i+=1){
                    if(activeUsers[i].id === userId && activeUsers[i].token === token){
                        //console.log('found in active users');
                        activeUsers[i].sockets.push(client);
                        //console.log('clearing intervals',activeUsers[i].intervals.length);
                        if(activeUsers[i].intervals.length>0){
                            clearTimeouts(activeUsers[i].intervals.slice(0));
                            activeUsers[i].intervals =[];
                        }

                        tokenFound = true;
                        break;
                    }
                }
            }

            if(!tokenFound){
                client.emit('force-disconnect', 'wrong token');
            } else {
                messageHandler.getUnreadMessages(userId)
                    .then(function(unreadMessages){

                        console.log('UNREAD',unreadMessages);
                        client.emit('unread',unreadMessages);
                    }, function(err){
                        console.log('err',err);
                    });
            }
        });

        client.on('disconnect', function () {
            for (var i = 0; i < activeUsers.length; i += 1) {
                if (activeUsers[i].sockets.indexOf(client)>=0) {
                    activeUsers[i].sockets.splice(activeUsers[i].sockets.indexOf(client),1);

                    var userId = activeUsers[i].id;

                    console.log('user ',activeUsers[i].id,'\'s disconnected');
                    if(activeUsers[i].sockets.length < 1) {
                        activeUsers[i].intervals.push(setTimeout(function (id, activeUsers) {
                            console.log('timeout for ',id,activeUsers);
                            deleteUserFromActive(id, activeUsers);
                        }, 10000, userId, activeUsers));
                    }
                }
            }
        });

        client.on('hello-server', function (data) {
            client.emit('hello-client',activeUsers.map(function(us){
                return {
                    id:us.id,
                    name:us.user,
                    sockets:us.sockets.length,
                    ints: us.intervals,
                    token:us.token
                }
            }));
        });

        client.on('message', function (data) {
            var token = data.token;

            var socket = getSecureSocket(client,token,activeUsers);

            if(socket){
                messageHandler.saveMessage(data);

                for (var i = 0; i < activeUsers.length; i += 1) {
                    if (activeUsers[i].id === data.receiver) {
                        delete data.token;
                        for(var j=0;j<activeUsers[i].sockets.length;j+=1){
                            activeUsers[i].sockets[j].emit('message',data);
                        }
                    }
                }
            } else {
                client.emit('force-disconnect','in message');
            }
        });

        client.on('get-messages', function(data){
            var socket = getSecureSocket(client,data.token,activeUsers);
            if(socket){
                data.myId = getUserId(client, data.token, data.myId, activeUsers);
                messageHandler.getMessages(data)
                    .then(function(messages){
                        messages.messages = messages.messages.reverse() || [];

                        client.emit('old-messages',messages);
                    });
            } else {
                client.disconnect();
            }
        });

        client.on('seen-all',function(data) {
            var socket = getSecureSocket(client,data.token,activeUsers);
            if(socket){
                console.log('will unsee',data);
                messageHandler.seenAll(data);
            } else {
                client.disconnect();
            }
        });

        client.on('save-post',function(data) {
            var socket = getSecureSocket(client,data.token,activeUsers);
            if(socket){
                data.dateTime = Date.now();
                postsHandler.savePost(data);
            } else {
                client.disconnect();
            }
        });

        client.on('change-avatar', function(data){
            var socket = getSecureSocket(client,data.token,activeUsers);
            if(socket){
                console.log('got avatar');
                userHandler.changeAvatar(data.id, data.url);
            } else {
                client.disconnect();
            }
        });
    });
}

module.exports = ioHandler;

function getSecureSocket(socket,token,activeUsers){
    for(var i=0;i<activeUsers.length; i+=1) {
        if(activeUsers[i].token === token && activeUsers[i].sockets.indexOf(socket)>=0) {
            return socket;
        }
    }

    return false;
}

function getUserId(socket,token, id, activeUsers){
    for(var i=0;i<activeUsers.length; i+=1) {
        if(activeUsers[i].token === token && activeUsers[i].id === id) {
            return id;
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

function deleteUserFromActive(id, activeUsers){

    for (var i = 0; i < activeUsers.length; i++) {
        if(activeUsers[i].id === id){
            console.log('user ',activeUsers[i].user,' is out');
            activeUsers = activeUsers.splice(i,1);
        }
    }
}

function clearTimeouts(intervals){
    for (var i = 0; i < intervals.length; i++) {
        console.log('clearing',intervals[i]);
        clearTimeout(intervals[i]);
    }
}