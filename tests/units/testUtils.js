(function() {
    describe('Utils', function() {
        it('displayMessage(message) should console.log a message', function() {
            //var utils = new Utils();
            var message = 'test me';
            sinon.stub(console, 'log');
            utils.displayMessage(message);
            expect(console.log.calledWith(message)).to.be.true;
            console.log.restore();
        });
    });
}());
