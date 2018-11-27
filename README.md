# WinkelManetti Online AdventsKalender

This repository contains the code for my family's online Advent Calendar published at

https://xmas.winman.online

Besides being a little surprise for my kids, it is a small Progressive Web App, developed in Javascript (server side technologies are Node.js and Express). 

# Background

Back in 2009, I created an online Advent Calendar for my wife, using the "electronic postcards" that you could make on [JibJab](https://www.jibjab.com).

That calendar is still published here: https://mauriziomanetti.it/adventskalender. 

Since it is 9 years old, it shows all its obsolescence, but what was mainly bothering me was the total lack of responsiveness: for a new calendar I wanted something that could be fully enjoyed on any modern device. 
I started with just the requirement of **responsiveness** and ended up developing (and losing sleep with) a **Progressive Web App** (PWA) that **can be installed** as a native device app (at least on Android devices, tell me about Apple devices, if you have the chance), can be (partially) **used when offline**, and **supports push notifications**.

Back then, reminders to the users (actually one user) about a new calendar day to be open was performed via e-mail (the access was password protected, with a different password per day which was the solution of a riddle sent in the body of the email). 

For the new calendar I opted for **push notifications**, which was for me the hardest part to understand, but I found an excellent tutorial with plenty of examples (and from which I also adapted some code) in the [Web Push Book by Matt Gaunt](https://web-push-book.gauntface.com/).

# A Progressive Web App

A PWA is a web app that uses modern web capabilities to deliver an app-like experience to users, e.g. it can be used even when the user has no Internet connection (at least to a certain extent). On Chrome for Android you can install it on the device (Add to Home Screen feature).

On the server side, a PWA can be developed in any language. In fact I started prototyping it in PHP, then I switched to Node.js because I wanted to learn it. On the client, you need of course to use Javascript.

This PWA was only tested in Chrome (and Chromium) for Linux and Chrome for Android. It might work on other modern browser as well.

In order to create a PWA, you need to write a Service Worker for your website.

A Service Worker is a piece of Javascript code associated with your website which the browser will keep running even when the website is not open in the browser (and in principle even when the browser is closed, but that depends on the browser and the platform). A Service Worker acts as a proxy (intercepting network request that the browser makes when requesting content from your website, such as displaying an image or clicking on a link) but also manages events triggered by external sources (like push notifications).

In order to work, the service worker script needs to be served over HTTPS.

## Service Workers

I am not going to explain all the details about how to develop a PWA, and how to write Service Workers, you'll find better information at the following links, which I read (and from which I stole some code):

- [Service Workers: an Introduction](https://developers.google.com/web/fundamentals/primers/service-workers/)
- [Using Service Workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers)
- [ServiceWorker Cookbook](https://serviceworke.rs)
- [Jake Archibald - Service Workers - first draft published](https://jakearchibald.com/2014/service-worker-first-draft/)

What I learned, in order to make a PWA...

- you need to understand what a service worker is and how to use it
- you need to publish your app under SSL
- you need to learn to handle the cache with the service workers

## Add to Home Screen dialog

A nice feature of progressive web app is that you can install them on the user device. Actually in Chrome for Android they really look like native Android applications. Starting from Chrome 70 there is also the possibility to [install a web app on a Desktop platform](https://developers.google.com/web/progressive-web-apps/desktop) (in Chrome OS, Linux and Windows)  

An "Add to Home Screen" feature is always available in Chrome for Android upon user interaction with the Chrome app menu (also for websites that are not PWAs, in such case what will end up creating in your home screen  just a link to the website). 

The interesting thing is that you can make an "Add to Home Screen" mini info bar appear in the browser to offer the user the possibility to immediately install the website as an app, without having to fiddle with Chrome menu.

![Add to Home Screen mini info bar](https://github.com/mauntrelio/Winman-AK/raw/master/docs/mini-info-bar.jpg "Add to Home Screen mini info bar")

When clicking on the mini info bar, an Add to Home Screen dialog will appear:

![Add to Home Screen dialog](https://github.com/mauntrelio/Winman-AK/raw/master/docs/add-to-home-screen.png "Add to Home Screen dialog")

The "Add to Home Screen" (A2HS) dialog will automatically appear in Chrome for Android, at least as of November 2018, under the following conditions:

- the web app is not already installed
- meets a user engagement heuristic (currently, the user has interacted with the domain for at least 30 seconds)
- includes a web app manifest that includes:
	- `short_name` or `name`
	- icons must include a 192px and a 512px sized icons
	- `start_url`
	- `display` must be one of: `fullscreen`, `standalone`, or `minimal-ui`
- it is served over HTTPS (required for service workers)
- has registered a service worker with a `fetch` event handler

as reported here: [Web Fundamentals: Add to Home Screen](https://developers.google.com/web/fundamentals/app-install-banners/)

In principle such criteria should also apply for an "Add to Home Screen" automatic dialog on Desktop platform, however I was only able to make it appear on Android. On the Desktop I add to go to the menu dialog of the browser, where the install option appeared.

![Install App on Desktop platform](https://github.com/mauntrelio/Winman-AK/raw/master/docs/install-desktop.jpg "Install App on Desktop platform")


## Push Notifications

Another dialog that will appear the first time you load the website is the Permission request for notification (actually I could improve the UX for this kind of request but I had no time).

![Request for notification permission](https://github.com/mauntrelio/Winman-AK/raw/master/docs/notify-permission-request.png "Request for notification permission")

This app is sending subscribed users at least one notification a day to alert about a new day to be "opened".

The Web push protocol and in general the Web Push mechanism is pretty messy and complicated, however all you need to know about Web Push Notification is in the [Web Push Book by Matt Gaunt](https://web-push-book.gauntface.com/).

What you will need to support Push Notifications:

- make the browser subscribe and get subscriptions' information on your server (and store them)
- create a way to send notifications for each subscribed user (web interface, scripts, whatever) by contacting the push service that the user's browser choose
- handle the push event in the Service Worker to show the notification

# Other things I learned: 

I opted for hosting all the needed media and assets on my site, which revealed to be less easy than I thought.

## Google fonts

To download the used Google Fonts and host them on my server (actually I only use one Google font) I used the web app [google-webfonts-helper](https://google-webfonts-helper.herokuapp.com/fonts).

## Video download and conversion

Luckily [JibJab](https://www.jibjab.com), with which I have a paid subscription, had enough e-postcards (now in the form of videos), to fill in the 24 slots of an Advent Calendar. 

However getting the videos to host them on my website was quite hard: [JibJab](https://www.jibjab.com) does not offer the option to download the videos from the website, and reverse engineering their e-card webpage was also kind of impossible. Download of the videos is available through their Android App, however the quality is much poorer compared with what you get on the website. Somehow, after some clever tentatives, I was able to download the video from the browser, just to discover that, apparently, the actual rendering of the videos with characters' faces is performed by the browser itself, so my download was perfectly pointless, resulting in a kind of reversed green screen video.

After some Google search and tries, I decided to record a screen capture. I tried (under Linux) a couple of different applications until I found a perfect solution in [Kazam](https://launchpad.net/kazam), a tool apparently not anymore actively developed, but perfectly working, which also gives the possibility to record a portion of the screen, and can capture the audio from any audio output channel (or input, or both!). It produced nice and good quality mp4 videos from what was rendered on my screen.

To convert the mp4 videos to a format that mobile devices like (webm), I used `ffmpeg`:

```bash
for file in *.mp4; do 
	filename=`basename $file .mp4`; 
	echo "Converting $filename";
	if [ ! -f $filename.webm ]; then 
		ffmpeg -i $filename.mp4 -c:v libvpx -crf 10 -b:v 1M -c:a libvorbis $filename.webm;
	fi	
done
```

## Image obfuscation

To obfuscate the image previews for the _closed_ days in the calendar I used an excellent [ImageMagick](https://www.imagemagick.org) script from [Fred's ImageMagick Scripts](http://www.fmwconcepts.com/imagemagick/index.php): `disperse`.

```bash
for file in *.jpg; do 
	filename=`basename $file .jpg`;
	obfuscated=`echo $filename | tr 'A-Za-z' 'N-ZA-Mn-za-m'`
	echo "Obfuscating $filename > $obfuscated"; 
	~/scripts/imagemagick/disperse -s 20 -d 10 -c 0 $filename.jpg /tmp/$filename.jpg; 
	~/scripts/imagemagick/disperse -s 20 -d 10 -c 0 /tmp/$filename.jpg /tmp/$obfuscated.png;
	convert -quality 30 /tmp/$obfuscated.png $obfuscated.jpg 
done
```

In the previous bash script the `disperse` script is used twice to get a better effect. I also obfuscated the filename with a trivial `rot13`, which later I reverted to a simpler numbering scheme. 
Finally the last conversion brings the jpg quality down to 30 (in a range 1 to 100) which impressively reduces the size of the images (since they are obfuscated the quality can be reduced a lot without harm).

## Start audio/video automatically on a web page

I try to start video automatically, when a day page is loaded. However, due to the [Chrome Autoplay Policy](https://developers.google.com/web/updates/2017/09/autoplay-policy-changes), this may work or not, depending on different factors.

To start audio automatically on the home page, however, [I used a trick](https://stackoverflow.com/questions/50490304/audio-autoplay-not-working-in-chrome), that may stop working with browser updates.

## Push Notifications cannot be ignored 

If you send a web push to the browser the Service Worker needs to handle it in the `push` event and it must display a notification by calling `self.registration.showNotification`. You cannot silently ignore a web push. 

Well, you can, but there is drawback.

I wanted to avoid annoying users by showing a notification about a specific date if they already visited the page for that date. Yet I wanted to notify maybe more than once a day those users who missed to visit the page. Thanks to the caching mechanism of a Service Worker it's easy to detect if the browser visited a page. 

So my idea was to check if the browser already visited the page when receiving the corresponding push and silently ignore it if that was the case. However, when you receive a push you MUST show a notification, otherwise, due to the default current policy implemented in Chrome ([Ensure Push API is used for Notifications](https://docs.google.com/document/d/13VxFdLJbMwxHrvnpDm8RXnU41W2ZlcP0mdWWe9zXQT8)) the browser will show an ugly default notification (_Website has been updated in the background_). This problem does not seem to affect Chromium. 

Avoiding multiple notifications for those users who already performed the action you expect them to do after sending a notification (visiting a URL, in our case) has to be performed server side, by NOT sending a web push in first place to those subscribers who already visited the page. 

<!-- That was of course a little bit more complicated so I implemented it as the last thing, and I had to save some extra data in the localStorage (basically the identifier of the notification subscription to be sent along with the information about the visited day when visiting the day page, so I could persist that information in the database).
 -->

## SVG icons instead of font icons

At the beginning I used [FontAwesome](https://fontawesome.com/) to display the few icons of the website in the buttons. But after some interesting readings ([Making the Switch Away from Icon Fonts to SVG](https://www.sarasoueidan.com/blog/icon-fonts-to-svg/)), I decided to switch to SVG icons, which was an excellent choice, especially because of a lot less data to be downloaded to render the website.

## NeDB

To persists data on the server, such as subscriptions information and subscribers' visits, following the examples described in the [Web Push Book by Matt Gaunt](https://web-push-book.gauntface.com/), I used [NeDB](https://github.com/louischatriot/nedb): I discovered a wonderful piece of software, that is for MongoDB what SQLite is for MySQL (or other relational SQL databases). Basically it is a Javascript database on files which implements a subset of the MongoDB APIs. Pretty useful for local development or for small storage needs.

## SSL

In order to host the site in https (needed for a Service Worker to register) I used [Let's Encrypt](https://letsencrypt.org/) certificates, that since January 2018 also offers wildcard SSL certificates (at no cost!) and makes extremely easy to create and install SSL certificates thanks to the EFF automation tool [EFF Certbot](https://certbot.eff.org/) (however you need to have SSH access to your server in order to use the automation tool).

## Deployment in production

Something more to be written here...

- Apache
- Phusion Passenger

# Notes about this repository

The contents of the folders `public/media` (which contains the videos and the pictures of the calendar) are not published in this github repository.

Some of the code is really bad, and inconsistent (e.g. sometimes jQuery `$.get` is used, sometimes the new standard `fetch` API, sometimes single quotes, sometimes double quotes), due to the fact that some of the parts were just copied/pasted or quickly re-adapted from the examples and documentation linked in the previous sections.

**Spoiler**: the configuration file in `config/default.json` will disclose the content of the future calendar days. However my children are still too young to check it out from Github :smile:️.

## Improvements

I still have an hard time to understand what Javascript Promises are and how they work... I am still improving the code.

Here a short list of "TODOs":

- Improve Service Worker cache invalidation when new content is available on the website
- Improve code quality, fix inconsistencies
- [Improve UX](https://web-push-book.gauntface.com/chapter-03/01-permission-ux/) for the notification permission request 
