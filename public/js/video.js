const Video = (function($, document, window, undefined){

  const init = function() {
    // start every videos after 2 seconds 
    // (may not work if user did not interact with the DOM before)
    var video = document.getElementById("video");
    if (video) {
      setTimeout(function(){ video.play(); }, 2000);
    }   

    // video fullscreen button
    $("#fullscreen").on("click", function(){
      var video = document.getElementById("video");
      try {
        // Webkit for video elements only
        video.webkitEnterFullScreen();
      } catch(err) {
        // Mozilla
        video.mozRequestFullScreen();
      } finally {
        video.play();
      }
    });
  }

  return {
    init: init
  }

})(jQuery, document, window);