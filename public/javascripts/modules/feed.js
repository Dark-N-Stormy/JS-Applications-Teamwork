//frontend javascript for feed
console.log('frontend javascript for feed');

var FeedHandler = Class.extend({
   init: function() {
       var that = this;
       $('.input-ask').on('keyup', function(e){
           if(e.which === 13){
               e.stopPropagation();
               e.preventDefault();
               var postMessage = $(e.target).val()
               that.savePost(postMessage);
               $(e.target).val('');
               window.location.reload();
           }
       });

       $('.btn-ask').on('click', function(e){
           e.preventDefault();
           var postMessage = $('.input-ask').val();
           that.savePost(postMessage);
           $('.input-ask').val('');
           window.location.reload();
       });
   },
   savePost:function(post){
        console.log('will save post');
       var data = {
           senderId: currentUser.id,
           sender: currentUser.username,
           senderImage: currentUser.avatar,
           message:post
       };

       socketHandler.emitPost(data);
   }
});

var feedHandler = new FeedHandler();