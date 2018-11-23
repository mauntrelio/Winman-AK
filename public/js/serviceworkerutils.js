const ServiceWorker = (function($, document, window, undefined){

  const urlBase64ToUint8Array = function(base64String) {
    var padding = '='.repeat((4 - base64String.length % 4) % 4);
    var base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    var rawData = window.atob(base64);
    var outputArray = new Uint8Array(rawData.length);

    for (var i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }


  const sendSubscription = function(subscription) {
    return fetch('/api/save-subscription', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(subscription)
    })
    .then(function(response) {
      if (!response.ok) {
        throw new Error('Bad status code from server.');
      }

      return response.json();
    })
    .then(function(responseData) {
      if (!(responseData.data && responseData.data.success)) {
        throw new Error('Bad response from server.');
      }
    });
  };


  const subscribeForPushNotification = function(registration) {
    const subscribeOptions = {
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array($("body").data("public-key"))
    };
    registration.pushManager.subscribe(subscribeOptions)
      .then(function(pushSubscription) {
          // console.log('Received PushSubscription: ', JSON.stringify(pushSubscription));
          // send subscription information to the server
          sendSubscription(pushSubscription);
          return pushSubscription;
        });
  };


  const register = function() {
    // register service Worker
    if ("serviceWorker" in navigator) {
      // console.log("Will the service worker register?");
      navigator.serviceWorker.register("sw.js")
        .then(function(registration) {
          var serviceWorker;
          if (registration.installing) {
            serviceWorker = registration.installing;
            // console.log('Service worker installing');
          } else if (registration.waiting) {
            serviceWorker = registration.waiting;
            // console.log('Service worker installed & waiting');
          } else if (registration.active) {
            serviceWorker = registration.active;
            // console.log('Service worker active');
          }

          if (serviceWorker) {
            // console.log("Yes, it did!");
            // console.log("sw current state", serviceWorker.state);
            serviceWorker.addEventListener("statechange", function(e) {
              // console.log("sw statechange : ", e.target.state);
              if (e.target.state == "activated") {
                // console.log("Just now activated. now we can subscribe for push notification")
                // subscribing here.
                subscribeForPushNotification(registration);
              }
            });
          }
        });    
    }
  }; 


  return {
    register: register,
    urlBase64ToUint8Array: urlBase64ToUint8Array,
    sendSubscription: sendSubscription
  }

})(jQuery, document, window);