//frontend javascript for chat
console.log('frontend javascript for chat');

var Chat = Class.extend({
    init: function() {
        this.sort()
        $('.all-users-container').mCustomScrollbar({
            axis:"y",
            theme:"dark",
            scrollbarPosition: "inside",
            alwaysShowScrollbar: 1,
            mouseWheel:{
                enable: true,
                preventDefault: true,
                scrollAmount: 100
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
            var chatMessages = $(this),
                chat = chatMessages.closest('.chat');
            chatMessages.scrollTop(chatMessages.scrollTop()-event.deltaY*20);
            if(chatMessages.scrollTop()<=50 && chat.attr('data-has-more-messages')==='1' && chat.attr('data-loading-more-messages')!=='1'){
                chat.attr('data-loading-more-messages','1');
                var partner = chat.attr('data-partner-id'),
                    count = chat.find('.chat-message').length;

                socketHandler.getMessages({
                    id:partner,
                    count:count,
                    offset:count
                });
            }
        });
    },
    getChatHTML: function(id,username, image){
        var emptyChat = $('.empty-chat').clone(true);
        emptyChat.attr('data-partner-id',id);
        emptyChat.removeClass('empty-chat');
        emptyChat.find('.chat-title').text(username);
        emptyChat.find('.chat-name').text(username);
        emptyChat.find('img.partner-profile-image').attr('src',image);

        return emptyChat;
    },
    addChat: function (id, username, avatar, open) {
        if ($('div[data-partner-id="' + id + '"]').length < 1 && currentUser.id!==id) {
            if(open === undefined ){ open =true; }

            socketHandler.getMessages({
                id:id,
                count:10,
                offset:0
            });

            var chatHtml = this.getChatHTML(id,username, avatar);
            chatHtml.css('display','none');
            chatHtml.find('img.spinner').css('display','block');
            $('.chat-bar').find('.chat').parent().append(chatHtml);

            var that = this;
            chatHtml.fadeIn({
                duration:200,
                complete:function(){
                    if(open) {
                        that.toggleChat(chatHtml, function(chat){
                            console.log('scrolling',chat.find('.chat-messages') );
                            chat.find('.chat-messages').scrollTop(99999999999);
                        });
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

        chat.find('.chat-messages')
            .scrollTop(999999999);
    },
    unread:function(data){
        var id =data._id,
            count = data.count,
            unseen =  false,
            that=this;

        var dateHelperObject = undefined,
            messages = this.convertMessagesToHtml(data.messages);

        var sender = $('.single-user[data-user-id="'+id+'"]'),
            username = sender.find('.single-user-username').text(),
            avatar = sender.find('img.single-user-image').attr('src');

        sender.attr('data-count',count).addClass('has-unread');

        var newChat = this.addChat(id,username,avatar,false);
        if((count+10) > data.messages.length){
            newChat.attr('data-has-more-messages',0);
        } else {
            newChat.attr('data-has-more-messages',1);
        }

        newChat.attr('data-unread-count',count);
        newChat.attr('data-shown-messages-count',data.messages.length);
        newChat.find('.chat-messages')
            .addClass('needs-scrolling')
            .append(messages);
        newChat.removeAttr('data-loading-more-messages');
        newChat.find('.chat-messages').scrollTop(9999999999999999);

    },
    loadMessages: function(data){
        var id =  data.id,
            messages = data.messages;

        var chat = $('.chat[data-partner-id="'+id+'"]'),
            count = +chat.attr('data-shown-messages-count'),
            messagesHtml  = this.convertMessagesToHtml(messages);

        var sender = $('.single-user[data-user-id="'+id+'"]'),
            username = sender.find('.single-user-username').text(),
            avatar = sender.find('img.single-user-image').attr('src');

        count = (count < 1) ? 10 : count;

        if(count > data.messages.length){
            chat.attr('data-has-more-messages',0);
        } else {
            chat.attr('data-has-more-messages',1);
        }

        var scrollBottom = (chat.find('.chat-messages .chat-message').length * chat.find('.chat-messages .chat-message').outerHeight()) - chat.find('.chat-messages').scrollTop();

        if(chat.find('.chat-message').length<1){
            chat.addClass('should-scroll');
        }

        chat.find('.chat-message').eq(0).addClass('top-most');
        chat.attr('data-shown-messages-count',data.messages.length);
        chat.find('.chat-messages .spinner')
            .after(messagesHtml);
        chat.removeAttr('data-loading-more-messages');
        chat.find('.spinner').hide();
        if(chat.find('.top-most').offset()) {
            chat.find('.chat-messages').scrollTop(chat.find('.top-most').offset().top - 35);
        } else {
            chat.find('.chat-messages').scrollTop(99999999999999);
        }
        //chat.find('.top-most').removeClass('.to-most');
        //chat.find('.chat-messages').scrollTop(chat.find('.chat-messages .chat-message').length * (chat.find('.chat-messages .chat-message').outerHeight()) - scrollBottom);
    },
    convertMessagesToHtml: function(messages){
        var dateHelperObject = undefined;

        messages = messages.map(function(message){
            message.dateTime = Date.parse(message.dateTime);

            if(!dateHelperObject){
                dateHelperObject = message.dateTime;
            }

            var newUnread = $('<div/>')
                .addClass('chat-message')
                .text(message.message);

            if(message.receiver === currentUser.id){
                newUnread.addClass('chat-message-received');

                if(message.seen===false){
                    newUnread.addClass('unseen');
                }
            } else {
                newUnread.addClass('chat-message-sent');
            }

            if((message.dateTime - dateHelperObject) >10*60*1000){
                newUnread.addClass('time-separator');
            }

            dateHelperObject = message.dateTime;

            return newUnread;
        });

        return messages;
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

        var chat = $('.chat[data-partner-id="'+data.sender+'"]'),
            chatMessages = chat.find('.chat-body .chat-messages');

        chatMessages.append(newMessage);
        if(chatMessages.scrollTop() > (chatMessages.find('.chat-message').length * chatMessages.find('.chat-message').outerHeight()-chatMessages.outerHeight()-200)) {
            chatMessages.scrollTop(chatMessages.find('.chat-message').length * chatMessages.find('.chat-message').outerHeight() + chatMessages.height());
        }
    },
    sendSeenAll:function(partnerId){
        $('.single-user[data-user-id="'+partnerId+'"]').removeClass('has-unread').attr('data-count','');
        this.sort();
        socketHandler.sendSeenAll({
            userId:currentUser.id,
            partnerId:partnerId
        });
    },
    sort: function(){
        var allUsersWrapper = $('.all-users-wrapper'),
            allUsers = allUsersWrapper.find('.single-user'),
            form = $('.user-search-form');

        allUsers.sort(function(userA, userB){
            if(userA.className.indexOf('has-unread')>=0 && !(userB.className.indexOf('has-unread')>=0)){
                return -1;
            } else if(!(userA.className.indexOf('has-unread')>=0) && userB.className.indexOf('has-unread')>=0) {
                return 1;
            }

            if(userA.className.indexOf('active')>=0 && !(userB.className.indexOf('active')>=0)){
                return -1;
            } else if(!(userA.className.indexOf('active')>=0) && userB.className.indexOf('active')>=0){
                return 1;
            }

            if(userA.innerText === userB.innerText){
                return 0;
            }
            return (userA.innerText.trim() < userB.innerText.trim()) ? -1 : 1;
        });

        allUsers.detach().appendTo(allUsersWrapper);
    }
});

var chatHandler = new Chat();

$('.single-user').on('click', function (e) {
    var clicked = $(this),
        id = clicked.attr('data-user-id'),
        username = clicked.find('.single-user-username').text(),
        avatar = clicked.find('img.single-user-image').attr('src');
    chatHandler.sendSeenAll(id);
    chatHandler.addChat(id, username, avatar);

});

$('.chat-bar').on('mouseup','.chat-title',function(){
    var chat = $(this).parent();
    chatHandler.sendSeenAll($(this).parent().attr('data-partner-id'));
    chatHandler.toggleChat(chat);
});

$('.chat-top-bar').on('click','.glyphicon',function(){
    if($(this).hasClass('close')){
        chatHandler.removeChat($(this).closest('.chat'));
    } else {
        chatHandler.toggleChat($(this).closest('.chat'));
    }

});

$('.chat textarea').on('click',function(e){
    console.log('focus on textarea');
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

var noUsersFoundDiv = $('<div></div>').addClass('no-matches'),
    noUsersFoundSpan = $('<span></span>');

noUsersFoundSpan.appendTo(noUsersFoundDiv);

$('.users-search-form input').on('keyup', function (e) {

    var searchText = $(this).val(),
        listOfUsers = $('.all-users-wrapper').children('.single-user'),
        counterOfHiddenUsers = 0,
        lenghtOfAllUsers = listOfUsers.size();

    $.each(listOfUsers, function () {
        var that = $(this),
            username = that.children('.single-user-username').html();

        if (username.toLowerCase().indexOf(searchText.toLowerCase()) < 0) {
            that.hide();
            counterOfHiddenUsers++;
        } else {
            that.show();
        }
    });

    if (counterOfHiddenUsers === lenghtOfAllUsers) {
        noUsersFoundSpan.html('No users matching "' + searchText+'"');
        $('.all-users-wrapper')
            .append(noUsersFoundDiv);
    }
    else {
        $('div').remove('.no-matches');
    }

    counterOfHiddenUsers = 0;
});