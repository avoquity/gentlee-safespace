
// Service Worker for Gentlee Check-In feature
const CACHE_NAME = 'gentlee-cache-v1';

// Install event
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        '/',
        '/index.html',
      ]);
    })
  );
});

// Activate event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Push event
self.addEventListener('push', function(event) {
  let data = {};
  try {
    data = event.data.json();
  } catch(e) {
    data = { 
      title: "Gentlee Check-in",
      message: "How are you feeling today?",
      type: "default"
    };
  }
  
  const title = data.title || "Gentlee Check-in";
  const message = data.message || "How are you feeling today?";
  const url = data.url || '/chat';
  
  const options = {
    body: message,
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    data: {
      url: url,
      type: data.type || 'default'
    }
  };
  
  event.waitUntil(self.registration.showNotification(title, options));
});

// Notification click event
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  
  // Log for analytics
  console.log('Push notification clicked');
  
  // Get the notification data
  const data = event.notification.data;
  const urlToOpen = data?.url || '/chat';
  
  // Open the relevant URL and focus the window
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(function(clientList) {
      // Check if there is already a window/tab open with the target URL
      for (var i = 0; i < clientList.length; i++) {
        var client = clientList[i];
        if (client.url.includes(urlToOpen) && 'focus' in client) {
          return client.focus();
        }
      }
      
      // If no window/tab is open, open a new one
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// Test notification handling - detect messages from the client
self.addEventListener('message', function(event) {
  if (event.data && event.data.type === 'SHOW_TEST_NOTIFICATION') {
    const title = event.data.title || 'Gentlee Test Notification';
    const message = event.data.message || 'This is a test notification from the service worker.';
    
    self.registration.showNotification(title, {
      body: message,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      data: {
        url: '/chat',
        type: 'test'
      }
    });
  }
});

// Fetch event
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
