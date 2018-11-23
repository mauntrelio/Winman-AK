const QRCode = (function($, document, window, undefined){

  const init = function() {
    // qrCode display
    $("#create_qrcode").on("click", function(e){
      var id = $(this).data("day");
      var url = "/qr";
      e.preventDefault();
      if (id) {
        url += "/" + encodeURIComponent(id);
      }
      showMessage("<img src=\"" + url + "\">");
    });

    // qrCode hide
    $("#overlay").on("click", function(e){
      $("#overlay").fadeOut();
      $("#qrcode").empty().fadeOut();
    });
  };

  // show a message 
  const showMessage = function(message) {
    $("#overlay").fadeIn();
    $("#qrcode").append(message).fadeIn();
  }

  return {
    init: init,
    showMessage: showMessage
  }

})(jQuery, document, window);