/*
Copyright 2016 Google Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
(function() {
  'use strict';

  self.importScripts('analytics-helper.js');
  // importScripts('../../../node_modules/offline-google-analytics-import.js');
  // goog.offlineGoogleAnalytics.initialize();
  // TODO Step 10: Add offline analytics
  var mainClientPort;
  self.addEventListener('message', function(event) {
    console.log('Service worker received message: ', event.data);
    mainClientPort = event.ports[0];
    console.log('Communication ports established');
  });

  // TODO Step 8g: Add notification close listener
  self.addEventListener('notificationclose', function(event) {
    mainClientPort = event.ports[0];
    var notification = event.notification;
    var primaryKey = notification.data.primaryKey;
    console.log('Closed notification:', primaryKey);
    mainClientPort.postMessage({
      eventCategory: 'notification',
      eventAction: 'closed'
    });

    event.waitUntil(
      sendAnalyticsEvent('close', 'notification')
    );
  });

  // TODO Step 8h: Add notification click listener
  self.addEventListener('notificationclick', function(event) {
    mainClientPort = event.ports[0];
    var notification = event.notification;
    var primaryKey = notification.data.primaryKey;
    var action = event.action;
    if (action === 'close') {
      notification.close();
      console.log('Closed notification:', primaryKey);
      mainClientPort.postMessage({
        eventCategory: 'notification',
        eventAction: 'closed'
      });
    } else if (action === 'open') {
      clients.openWindow('pages/page' + primaryKey + '.html');
      notification.close();
      console.log('Notification opened');
      mainClientPort.postMessage({
        eventCategory: 'notification',
        eventAction: 'opened'
      });
    } else {
      clients.openWindow('pages/page' + primaryKey + '.html');
      notification.close();
      console.log('Notification clicked');
      mainClientPort.postMessage({
        eventCategory: 'notification',
        eventAction: 'clicked'
      });
    }
    sendAnalyticsEvent('click', 'notification')
  });

  self.addEventListener('push', function(event) {
    mainClientPort = event.ports[0];
    console.log('Push recieved');
    mainClientPort.postMessage({
      eventCategory: 'push',
      eventAction: 'recieved'
    });
    if (Notification.permission === 'denied') {
      console.warn('Push notification failed, notifications are blocked');
      mainClientPort.postMessage({
        eventCategory: 'push',
        eventAction: 'blocked'
      });
      return;
    }
    var options = {
      body: 'This notification was generated from a push!',
      icon: 'images/notification-flat.png',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: '2'
      },
      actions: [
        {action: 'open', title: 'Open the site!',
          icon: 'images/checkmark.png'},
        {action: 'close', title: 'Go away!',
          icon: 'images/xmark.png'},
      ]
    };
    event.waitUntil(
      Promise.all([
        self.registration.showNotification('Hello world!', options),
        mainClientPort.postMessage({
          eventCategory: 'notification',
          eventAction: 'displayed-push'
        })
      ])
    );

    sendAnalyticsEvent('received', 'push')
  });

  // TODO Step 8j: Add message listener & establish communication

  // TODO Step 9c: Add push listener

})();
