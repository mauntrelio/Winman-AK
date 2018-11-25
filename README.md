# WinkelManetti Online AdventsKalender

This repository contains the code for my family's online Advent Calendar published at

https://xmas.winman.online

Besides being a little surprise for my kids, it is a small Progressive Web App, developed in Javascript (server side technologies are Node.js and Express). 

# Background

Back in 2009, I created an online Advent Calendar for my wife, using the "electronic postcards" that you could make on [JibJab](https://www.jibjab.com).

That calendar is still published here: https://mauriziomanetti.it/adventskalender. 

Since it is 9 years old, it shows all its obsolescence, but what was mainly bothering me was the total lack of responsiveness: for a new calendar I wanted something that could be fully enjoyed on any modern device. 
I started just with the requirement of **responsiveness** and ended up developing (and losing sleep) a **Progressive Web App** (PWA) that **can be installed** (at least on Android devices, tell me about Apple devices, if you have the chance) as a native device app, can be (partially) **used when offline**, and **supports push notifications**.

Back then, reminders to the users (actually one user) about a new calendar day to be open was performed via e-mail (the access was password protected, with a different password per day which was the solution of a riddle sent in the body of the email). 

For the new calendar I opted of course for **push notifications**, and this was for me the hardest part to understand, but I found an excellent tutorial with plenty of examples (and from which I also adapted some code) in here: [Web Push Book by Matt Gaunt](https://web-push-book.gauntface.com/).

# A Progressive Web App

A PWA is a web app that uses modern web capabilities to deliver an app-like experience to users, e.g. it can be used even when the user has no Internet connection (at least to a certain extent). On Chrome for Android you can install it on the device (Add to Home Screen feature).

On the server side, a PWA can be developed in any language. In fact I started prototyping it in PHP, then I switched to Node.js because I wanted to learn it. On the client, you need of course to use Javascript.

This PWA was only tested in Chrome (and Chromium) for Linux and Chrome for Android. It might work on other modern browser as well.

In order to create a PWA, you need to write a Service Worker for your website.

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

What you need to make the "Add to Home Screen" (A2HS) dialog appear in Chrome for Android, at least as of November 2018:

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

## Push Notification

This app is sending subscribed users a notification a day, to alert about a new day to be "opened".

All you need to know about Web Push Notification is in the [Web Push Book by Matt Gaunt](https://web-push-book.gauntface.com/).

What you will need to support Push Notifications:

- make the browser subscribe and get subscriptions' information on your server (and store them)
- create a way to send notifications for each subscribed user (web interface, scripts, whatever) by contacting the push service that the user's browser choose
- handle the push event in the Service Worker to show the notification

# Other things I learned: 

I opted for hosting all the needed media and assets on my site, which revealed to be less easy than I thought.

## Google fonts

To download the used Google Fonts and host them locally (actually I only use one special font) I used [google-webfonts-helper](https://google-webfonts-helper.herokuapp.com/fonts).

## Video download and conversion

Luckily [JibJab](https://www.jibjab.com), with which I have a paid subscription, had enough e-postcards (now in the form of videos), to fill in the 24 slots of an Advent Calendar. 

However getting the videos to host them on my website was: [JibJab](https://www.jibjab.com) does not offer the option to download the videos from the website, and reverse engineering their e-card webpage was also kind of impossible. It is possible to download the videos through their Android App, however the quality is much poorer compared with what you get on the website. Somehow, after some clever tentatives, I was able to download the video from the browser, just to discover that, apparently, the actual rendering of the videos with characters' faces is performed by the browser itself, so my download was perfectly pointless, resulting in a kind of reversed green screen videos.

After some Google search and tries, I decided to record a screen capture. I am a Linux user, and I tried a couple of different applications until I found a perfect solution in [Kazam](https://launchpad.net/kazam), a tool apparently not anymore actively developed, but perfectly working, which also gives the possibility to record a portion of the screen, and can capture the audio from any audio output channel (or input, or both!). It produced nice and good quality mp4 videos from what was rendered on my screen.

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

If you send a web push to the browser the Service Worker needs to handle it in the `push` event and he had to display a notification by calling `self.registration.showNotification`. One cannot silently ignore a web push. 

Well, you can, but there is drawback.

What I wanted to do is to avoid annoying users by showing a notification about a specific date if they already visited the page for that date. Thanks to the caching mechanism of a Service Worker it's easy to detect it. However, when you receive a push you MUST show a notification, otherwise, due to the default current policy implemented in Chrome ([Ensure Push API is used for Notifications](https://docs.google.com/document/d/13VxFdLJbMwxHrvnpDm8RXnU41W2ZlcP0mdWWe9zXQT8)) the browser will show an ugly default notification (_Website has been updated in the background_). This problem does not seem to affect Chromium. 

A way to detect if a user already visited the URL you want to notify him about (and avoid showing unneeded notifications) has to be performed server side, by not sending a web push in first place (to those subscribers which already visited the page), but that is of course a little bit more complicated so I was not implementing such a mechanism so far because I had not enough time.

## SVG icons instead of font icons

At the beginning I used [FontAwesome](https://fontawesome.com/) to display the few icons of the website in the buttons. But after some interesting readings ([Making the Switch Away from Icon Fonts to SVG](https://www.sarasoueidan.com/blog/icon-fonts-to-svg/)), I decided to switch to SVG icons, which was an excellent choice, especially because of a lot less data to be downloaded to render the website.

## NeDB

To store data on the server, just by following the examples described in the [Web Push Book by Matt Gaunt](https://web-push-book.gauntface.com/), I used [NeDB](https://github.com/louischatriot/nedb): so I discovered a wonderful piece of software, that is to MongoDB what SQLite is to MySQL (or other relational SQL databases). Basically it is a Javascript database on files which implements a subset of the MongoDB APIs.

## SSL

In order to host the site in https (needed for a Service Worker to register) I used [Let's Encrypt](https://letsencrypt.org/), that since January 2018 also offers wildcard SSL certificates (at no cost!) and makes extremely easy to create and install SSL certificates thanks to the EFF automation tool [EFF Certbot](https://certbot.eff.org/) (however you need to have SSH access to your server in order to use the automation tool).

## Deployment in production

Something more to be written here...

- Apache
- Phusion Passenger

# Notes about this repository

The contents of the folders `public/media` (which contains the videos and the pictures of the calendar) are not published in this github repository.

**Spoiler**: the configuration file in `config/default.json` will disclose the content of the future calendar days. However my children are still too young to check it out from Github :smile:️.

## Possible improvements

I still have an hard time to understand what Javascript Promises are and how they work... I am still improving the code.

Here a list of "TODOs":

- Improve code quality
- Implement server side detection of pages visited by users who subscribed for notification (e.g. by storing the `endpoint` of the subscription request result in the local storage and then sending it to the server when visiting a page, so the server is informed which subscribed users do not need to be notified for that day)
- [Improve UX](https://web-push-book.gauntface.com/chapter-03/01-permission-ux/) for the notification permission request 
