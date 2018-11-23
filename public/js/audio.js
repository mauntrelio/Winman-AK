const Audio = (function($, document, window, undefined){

  var audio_player;

  // audio switch
  const audio_switch = function(flag) {
    flag = flag || "off";
    var $icon = $("#audio_switch").find("svg.icon-volume-up");
    if ($icon.length > 0 && audio_player) {
      if (flag == "off") {
        $icon.hide();
        $icon.next("svg").show();
        audio_player.muted = true;
      } else {
        $icon.next("svg").hide();
        $icon.show();
        audio_player.muted = false;
      }  
    }
  }

  const init = function() {

    audio_player = document.getElementById("audio_player");

    // start with audio off if in user preference
    if (localStorage.getItem("audio") == "off") {
      audio_switch("off");
    }

    // start music at last remembered position
    var position = parseInt(localStorage.getItem("audio_position"));
    if (position > 0) {
      if (audio_player) {
        audio_player.currentTime = position;
      } 
    }

    // mute/unmute audio
    $("#audio_switch").on("click", function(e){
      e.preventDefault();
      var $icon = $(this).find("svg.icon-volume-up");
      if ($icon.is(":visible")) {
        audio_switch("off");
        localStorage.setItem("audio","off");
      } else {
        audio_switch("on");
        localStorage.setItem("audio","on");
      }
    });

    // rember audio position when leaving page
    $(window).on("beforeunload", function(){
      if (audio_player) {
        var time = audio_player.currentTime;
        localStorage.setItem("audio_position",time);
      }
    });
   }

  return {
    init: init,
    audio_switch: audio_switch
  }

})(jQuery, document, window);