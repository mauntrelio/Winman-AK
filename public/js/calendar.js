const Calendar = (function($, document, window, undefined){

  const init = function() {

    var $closed_days = $("div.kalender a:not(.open)");
    
    // render calendar with open days
    $closed_days.each(function(){
      var $this = $(this); 
      var day = $this.data("day");
      var data = localStorage.getItem("advkal-" + day);
      
      if (data) {
        try {
          data = JSON.parse(data);
          if (data.image)
            $this.addClass("open");
            $this.css("background-image", "url('media/" + data.image + ".jpg')");
          if (data.text)
            $this.attr("title", data.text);
        } catch(err) {
          console.error("Error parsing localStorage 'advkal-" + day + "'");
        }
      }
    });

    // bind day links
    $closed_days.on("click", function(e){
      
      var $this = $(this);
      var url = $this.attr("href");
      var day = $this.data("day");

      e.preventDefault();

      // may have a class open added dynamically: was already opened
      if ($this.hasClass("open")) {
        window.location.href = url;
        return;
      }

      $.get("/ajax/" + day, function(data){
        if (data.status == "OK") {
          $this.addClass("open");
          $this.css("background-image", "url('media/" + data.image + ".jpg'");
          setTimeout(function(){ window.location.href = url }, 1000);
          var advkal = JSON.stringify({image: data.image, text: data.text});
          // save settings
          localStorage.setItem("advkal-" + day, advkal);
        } else if (data.status == "ERROR") {
          QRCode.showMessage("<div>" + data.message + "</div>");
        } else {
          QRCode.showMessage("<div>No Internet?<br><br><img src=\"/img/offline.png\"></div>")
        }
      });

    });   

    // save settings when display day page
    var $video = $("#video");
    if ($video.length > 0) {
      var day = $video.data("day");
      if (day) {
        var advkal = JSON.stringify({image: $video.data("image"), text: $video.data("text")});
        // save settings
        localStorage.setItem("advkal-" + day, advkal);
      };
    }

  }

  return {
    init: init
  }

})(jQuery, document, window);