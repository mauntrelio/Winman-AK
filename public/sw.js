var CACHE_NAME = "xmas-cache-v15";
var urlsToCache = [
  "/",
  "/qr",
  "/offline",
  "/img/bg1.jpg",
  "/img/offline.png",
  "/img/launcher-icon-1x.png",
  "/img/launcher-icon-4x.png",
  "/img/forkme.png",
  "/img/icons.svg",
  "/audio/np.mp3",
  "/audio/silence.mp3",
  "/css/spicy-rice.css",
  "/css/reset.css",
  "/css/icons.css",
  "/css/style.css",
  "/webfonts/spicy-rice-v6-latin-regular.eot",
  "/webfonts/spicy-rice-v6-latin-regular.svg",
  "/webfonts/spicy-rice-v6-latin-regular.ttf",
  "/webfonts/spicy-rice-v6-latin-regular.woff",
  "/webfonts/spicy-rice-v6-latin-regular.woff2",
  "/js/jquery-3.3.1.min.js",
  "/js/audio.js",
  "/js/calendar.js",
  "/js/qrcode.js",
  "/js/serviceworkerutils.js",
  "/js/video.js",
  "/js/xmas.js",
  "/media/01.jpg",
  "/media/02.jpg",  
  "/media/03.jpg",
  "/media/04.jpg",
  "/media/05.jpg",
  "/media/06.jpg",
  "/media/07.jpg",
  "/media/08.jpg",
  "/media/09.jpg",
  "/media/10.jpg",
  "/media/11.jpg",
  "/media/12.jpg",
  "/media/13.jpg",
  "/media/14.jpg",
  "/media/15.jpg",
  "/media/16.jpg",
  "/media/17.jpg",
  "/media/18.jpg",
  "/media/19.jpg",
  "/media/20.jpg",
  "/media/21.jpg",
  "/media/22.jpg",
  "/media/23.jpg",
  "/media/24.jpg"
];


/* install the service worker */
self.addEventListener("install", function(event) {
  // Perform install steps
  event.waitUntil(
    // remove old cache
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (CACHE_NAME !== cacheName) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(
      // populate new cache
      caches.open(CACHE_NAME).then(function(cache) {
        return cache.addAll(urlsToCache);
      })
    ));
});


/* navigation from the browser */
self.addEventListener("fetch", function(event) {
  event.respondWith(caches.match(event.request).then(function(response) {
    // caches.match() always resolves
    // but in case of success response will have value
    if (response !== undefined) {
      // console.log("Found response in cache:", response);
      return response;
    } else {
      // console.log("No response found in cache. About to fetch from network...");
      return fetch(event.request).then(function (response) {

        var can_cache = false;
        var content_type = response.headers.get("Content-Type");
        var page_status = response.headers.get("X-Page-Status");

        // only cache GET html and json content if header X-Page-Status is completed
        if (!content_type.startsWith("text/html") && !content_type.startsWith("application/json")) {
          can_cache = true;
        } else if (page_status == "completed") {
          can_cache = true;
        }

        if (event.request.method != "GET") {
          can_cache = false;
        }

        if ( can_cache ) {
          // response may be used only once
          // we need to save clone to put one copy in cache
          // and serve second one
          let responseClone = response.clone();
          caches.open(CACHE_NAME).then(function (cache) {
            cache.put(event.request, responseClone);
          });
        }  
        return response;
      }).catch(function () {
        // console.log("No response found in cache and no network. Fall back on offline content");
        if (/\/qr/.test(event.request.url)) {
          return caches.match("/img/offline.png");
        } else {
          return caches.match("/offline");
        }
      });
    }
  }));
});


/* push notification received */
self.addEventListener("push", function(event) {
  // payload of notification at the moment only includes the day we notify about
  var payload = event.data ? event.data.json() : false;
  if (!payload) {
    return;
  }

  // show notification
  event.waitUntil(self.registration.showNotification("WinMan AdventsKalendar", {
                  body: payload.text,
                  icon: payload.image,
                  tag: "message-" + payload.day,
                  renotify: true,
                  requireInteraction: true,
                  vibrate: [300,100,300,100,800],
                  badge: "/img/badge.png",
                  data: {
                    url: payload.url 
                  }
                }));
  
});


/* notification was clicked */
self.addEventListener("notificationclick", function(event) {
  const clickedNotification = event.notification;
  clickedNotification.close();
  // open the page of the calendar
  event.waitUntil(clients.openWindow(clickedNotification.data.url));
});