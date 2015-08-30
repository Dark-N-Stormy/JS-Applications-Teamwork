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
                }
            })
    },
    getChatHTML: function(id,username, image){
        var emptyChat = $('.empty-chat').clone(true);
        emptyChat.attr('data-partner-id',id);
        emptyChat.removeClass('empty-chat');
        emptyChat.find('.chat-title').text(username);
        emptyChat.find('img').attr('src',image);

        return emptyChat;
    },
    addChat: function (id, username, avatar) {
        if ($('div[data-partner-id="' + id + '"]').length < 1 && currentUser.id!==id) {
            var chatHtml = this.getChatHTML(id,username, avatar);
            chatHtml.css('display','none');
            $('.chat-bar').find('.chat').parent().append(chatHtml);

            var that = this;
            chatHtml.fadeIn({
                duration:200,
                complete:function(){
                    that.toggleChat(chatHtml);
                }
            });
        } else {
            if(currentUser.id===id){
                utils.displayMessage('You dont need this chat to talk to yourself :)');
            }

            if($('div[data-partner-id="' + id + '"]').length >0){
                utils.displayMessage('You have already opened a chat with this user');
            }
        }
    },
    toggleChat: function(chat){
        var chatBody = chat.find('.chat-body');

        if(chat.hasClass('opened')){
            chatBody.animate({height:0},{
                queue:false,
                complete:function(){
                    chatBody.hide();
                }
            });
        } else {
            chatBody.show();
            chatBody.css('height','30px');
            chatBody.animate({height:250},{queue:false});
        }
        chat.toggleClass('opened');
    },
    sendMessage: function (message,chat) {
        var newMessage = $('<div/>')
            .addClass('chat-message chat-message-sent')
            .html(message);

        chat.find('.chat-messages')
            .append(newMessage);
    },
    receivedMessage: function (data) {
        var newMessage = $('<div/>')
            .addClass('chat-message chat-message-received')
            .html(data.message);

        if($('.chat[data-partner-id="'+data.sender+'"]').length<1){
            var sender = $('.single-user[data-user-id="'+data.sender+'"]'),
                id = sender.attr('data-user-id'),
                username = sender.find('.single-user-username').text(),
                avatar = sender.find('img.single-user-image').attr('src');
            console.log('will add chat',id,username,avatar);

            console.log('.single-user [data-user-id="'+data.sender+'"]');
            console.log($('.single-user [data-user-id="'+data.sender+'"]'));
            this.addChat(id,username, avatar)
        }
        $('.chat[data-partner-id="'+data.sender+'"]')
            .find('.chat-body .chat-messages')
            .append(newMessage);
        //$('.received-messages .panel-body').append(newMessage);
    },
    sentMessage: function (msg,chat) {

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
    console.log($(this));
    console.log($(this).parent().parent());
    chatHandler.toggleChat($(this).closest('.chat'));
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