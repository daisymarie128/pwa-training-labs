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
'use strict';

self.addEventListener('notificationclose', function(e) {
  var notification = e.notification;
  var primaryKey = notification.data.primaryKey;

  console.log('Closed notification: ' + primaryKey);
});

self.addEventListener('notificationclick', function(e) {
  var notification = e.notification;
  var primaryKey = notification.data.primaryKey;
  var action = e.action;

  if (action === 'close') {
    notification.close();
  } else {
    e.waitUntil(
      clients.matchAll().then(function(clis) {
        var client = clis.find(function(c) {
          return c.visibilityState === 'visible';
        });
        if (client != undefined) {
          client.navigate('samples/page' + primaryKey + '.html');
          client.focus();
        } else {
          // there are no visible windows. Open one.
          clients.openWindow('samples/page' + primaryKey + '.html');
          notification.close();
        }
      })
    );
  }

  self.registration.getNotifications().then(function(notifications) {
    notifications.forEach(function(notification) {
      notification.close();
    });
  });
});

self.addEventListener('push', function(e) {
  if (e.data) {
    var data = e.data.json();
    var title = data.title;
    var body = data.body;
    var primaryKey = data.primaryKey;
  } else {
    var title = 'Push message no payload';
    var body = 'Default body';
    var primaryKey = 1;
  }

  var options = {
    body: body,
    icon: 'images/notification-flat.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: primaryKey
    },
    actions: [
      {action: 'explore', title: 'Go to the site',
        icon: 'images/checkmark.png'},
      {action: 'close', title: 'Close the notification',
        icon: 'images/xmark.png'},
    ]
  };

  clients.matchAll().then(function(c) {
    if (c.length == 0) {
      // Show notification
      e.waitUntil(
        self.registration.showNotification(title, options)
      );
    } else {
      // Send a message to the page to update the UI
      console.log('Application is already open!');
    }
  });
});
