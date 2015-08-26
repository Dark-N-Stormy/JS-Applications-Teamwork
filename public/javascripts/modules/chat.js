//frontend javascript for chat
console.log('frontend javascript for chat');

$('.btn').on('click',function(e){
    e.preventDefault();
   var message = $('input').val();
    $('input').val('');

    socketSendHandler.sendMessage(message);

    var newMessage = $('<div/>').html(message);
    $('.sent-messages .panel-body').append(newMessage);
});

function recievedMessage(msg){
    var newMessage = $('<div/>').html(msg);
    $('.recieved-messages .panel-body').append(newMessage);
}