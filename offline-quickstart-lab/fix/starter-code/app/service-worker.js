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
// Insert your service worker code here
var CACHE_NAME = 'static-cache';
var urlsToCache = [
  '.',
  'index.html',
  'css/main.css',
  'http://fonts.googleapis.com/css?family=Roboto:300,400,500,700',
];

// gets fired after we've checked that the browser can use workers.
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
    // cache all the files we specified
    .then(function(cache) {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    // Tries to match the request with the content of the cache, and if the resource is in the cache, then returns it.
    caches.match(event.request)
    .then(function(response) {
      // If the resource is not in the cache, attempts to get the resource from the network using fetch.
      return response || fetchAndCache(event.request);
    })
  );
});

function fetchAndCache(url) {
  return fetch(url)
  .then(function(response) {
    // Check if we received a valid response
    if (!response.ok) {
      throw Error(response.statusText);
    }
    return caches.open(CACHE_NAME)
    .then(function(cache) {
      cache.put(url, response.clone());
      return response;
    });
  })
  .catch(function(error) {
    console.log('Request failed:', error);
    // You could return a custom offline 404 page here
  });
}
