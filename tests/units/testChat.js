(function() {
    describe('Chat', function() {
        it('expect sendMessage to be a div', function() {

            var message = 'I am div';
            var chat = $('.chat');
            var newChat = new Chat();
            
            newChat.sendMessage(message, chat);

            expect($('.').is('div')).to.be.true;
            expect(chatMessage.hasClass('chat-message-sent')).to.be.true;
            expect(chatMessage.html()).to.equal('I am div');
        });
    });
}());
