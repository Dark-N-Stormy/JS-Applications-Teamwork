//frontend javascript for chat
console.log('frontend javascript for chat');
var Chat = Class.extend({
    init: function() {
        $('.all-users-container').mCustomScrollbar({
            axis:"y",
            theme:"dark",
            scrollbarPosition: "inside",
            alwaysShowScrollbar: 1,
            mouseWheel:{
                enable: true,
                preventDefault: true
            },
            advanced:{
                updateOnContentResize: true
            }
        });

        $(".chat-bar-wrapper").mousewheel(function(event, delta) {
            event.preventDefault();
            event.stopPropagation();
            $('.chat-bar').mCustomScrollbar("scrollTo",(delta < 0) ? '-=80' : '+=80' );
        });

        $('.chat-bar')
            .mCustomScrollbar({
                axis:"x",
                advanced:{
                    autoExpandHorizontalScroll: true,
                    updateOnContentResize: true
                },
                mouseWheel:{
                    disableOver: [
                        ".chat-messages"
                    ]
                }
            });

        $('.chat-messages').mousewheel(function(event){
            event.stopPropagation();
            event.preventDefault();
            var chatMessages = $(this);
            chatMessages.scrollTop(chatMessages.scrollTop()-event.deltaY*20);
            if(chatMessages.scrollTop()<=50 && !chatMessages.hasClass('loading-more')){
                chatMessages.addClass('loading-more');
                var chat = chatMessages.closest('.chat'),
                    //currentMessagesCount = chat.attr('data-messages-count'),
                    partner = chat.attr('data-partner-id');

                //this.loadMoreMessages(currentMessagesCount + 20);
            }
        });
    },
    getChatHTML: function(id,username, image){
        var emptyChat = $('.empty-chat').clone(true);
        emptyChat.attr('data-partner-id',id);
        emptyChat.removeClass('empty-chat');
        emptyChat.find('.chat-title').text(username);
        emptyChat.find('.chat-name').text(username);
        emptyChat.find('img').attr('src',image);

        return emptyChat;
    },
    addChat: function (id, username, avatar, open) {
        if ($('div[data-partner-id="' + id + '"]').length < 1 && currentUser.id!==id) {
            if(open === undefined ){ open =true; }

            var chatHtml = this.getChatHTML(id,username, avatar);
            chatHtml.css('display','none');
            $('.chat-bar').find('.chat').parent().append(chatHtml);

            var that = this;
            chatHtml.fadeIn({
                duration:200,
                complete:function(){
                    console.log(open);
                    if(open) {

                        that.toggleChat(chatHtml);
                    }
                }
            });

            return chatHtml;
        } else {
            if(currentUser.id===id){
                utils.displayMessage('You dont need this chat to talk to yourself :)');
            }

            if($('div[data-partner-id="' + id + '"]').length >0 && $('div[data-partner-id="' + id + '"]').hasClass('opened')){
                utils.displayMessage('You have already opened a chat with this user');
            } else  if($('div[data-partner-id="' + id + '"]').length >0 && !$('div[data-partner-id="' + id + '"]').hasClass('opened')){
                this.toggleChat($('div[data-partner-id="' + id + '"]'));
            }
        }
    },
    toggleChat: function(chat, callback){
        var chatBody = chat.find('.chat-body');

        if(chat.hasClass('opened')){
            chatBody.animate({height:0},{
                queue:false,
                complete:function(){
                    if(callback){
                        callback(chat);
                    }

                    chatBody.hide();
                }
            });
        } else {
            chatBody.show();
            chatBody.css('height','30px');
            if(chatBody.find('.chat-messages').hasClass('needs-scrolling')){
                chatBody.find('.chat-messages').scrollTop(9999999999);
                chatBody.find('.chat-messages').removeClass('needs-scrolling');
            }
            chatBody.animate({height:300},{
                queue:false,
                complete:function(){
                    if(callback) {
                        callback(chat);
                    }
                }
            });
        }
        chat.toggleClass('opened');
    },
    removeChat: function(chat){
        this.toggleChat(chat,function(chat){
            chat.fadeOut(function(){
                $(this).detach()
            });
        });
    },
    sendMessage: function (message,chat) {
        var newMessage = $('<div/>')
            .addClass('chat-message chat-message-sent')
            .html(message);

        chat.find('.chat-messages')
            .append(newMessage);
    },
    unread:function(data){
        var id =data._id,
            count = data.count;

        var messages = data.messages.map(function(message){
            var newUnread = $('<div/>')
                .addClass('chat-message chat-message-received unseen')
                .text(message);

            return newUnread;
        });

        var sender = $('.single-user[data-user-id="'+id+'"]'),
            username = sender.find('.single-user-username').text(),
            avatar = sender.find('img.single-user-image').attr('src');

        sender.attr('data-count',count).addClass('has-unread');

        var newChat = this.addChat(id,username,avatar,false);

        newChat.attr('data-unread-count',count);
        newChat.find('.chat-messages')
            .addClass('needs-scrolling')
            .append(messages);
    },
    receivedMessage: function (data) {
        var newMessage = $('<div/>')
            .addClass('chat-message chat-message-received unseen')
            .html(data.message);

        if($('.chat[data-partner-id="'+data.sender+'"]').length<1){
            var sender = $('.single-user[data-user-id="'+data.sender+'"]'),
                id = sender.attr('data-user-id'),
                username = sender.find('.single-user-username').text(),
                avatar = sender.find('img.single-user-image').attr('src');

            this.addChat(id,username, avatar)
        }
        $('.chat[data-partner-id="'+data.sender+'"]')
            .find('.chat-body .chat-messages')
            .append(newMessage)
            .scrollTop(9999999999);
    },
    sendSeenAll:function(partnerId){
        socketHandler.sendSeenAll({
            userId:currentUser.id,
            partnerId:partnerId
        });
    }
});

var chatHandler = new Chat();

$('input').on('keypress', function (e) {
    if (e.which !== 13) {
        return;
    }
    e.preventDefault();
    chatHandler.sendMessage();
});
//
//$('.btn').on('click',function(e){
//    e.preventDefault();
//    chatHandler.sendMessage();
//});

$('.single-user').on('click', function (e) {
    var clicked = $(this),
        id = clicked.attr('data-user-id'),
        username = clicked.find('.single-user-username').text(),
        avatar = clicked.find('img.single-user-image').attr('src');

    chatHandler.addChat(id, username, avatar);

});

$('.chat-bar').on('mouseup','.chat-title',function(){
    var chat = $(this).parent();

    chatHandler.toggleChat(chat);
});

$('.chat-top-bar').on('click','.glyphicon',function(){
    if($(this).hasClass('close')){
        chatHandler.removeChat($(this).closest('.chat'));
    } else {
        chatHandler.toggleChat($(this).closest('.chat'));
    }

});

$('.chat textarea').on('focus',function(e){
    var unseen = $(this).siblings('.chat-messages').find('.chat-message-received.unseen');
    if(unseen.length>0){
        unseen.removeClass('unseen');
        var partnerId = unseen.closest('.chat').attr('data-partner-id');
        chatHandler.sendSeenAll(partnerId);
    }
});

$('.chat textarea').on('keydown',function(e){
    if(e.which===13 || e.keyCode===13){
        e.preventDefault();
        var message = $(this).val(),
            receiver = $(this).closest('.chat').attr('data-partner-id');

        $(this).val('');
        var message = message.trim(' ');
        if(message.length>0) {
            chatHandler.sendMessage(message,$(this).closest('.chat'));
            socketHandler.sendMessage(message, receiver);
        }
    }
});

$('.chat .chat-send').on('click',function(){
    var message = $(this).siblings('textarea').val(),
        receiver = $(this).closest('.chat').attr('data-partner-id');

    $(this).siblings('textarea').val('');
    var message = message.trim(' ');
    if(message.length>0) {
        chatHandler.sendMessage(message,$(this).closest('.chat'));
        socketHandler.sendMessage(message, receiver);
    }
});