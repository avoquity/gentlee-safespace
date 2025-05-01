
// Service Worker for Gentlee Check-In feature
const CACHE_NAME = 'gentlee-cache-v1';

// Install event
self.addEventListener('install', (event) => {
  self.skipWaiting();
  console.log('Service worker installed');
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
  console.log('Service worker activated');
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
  console.log('Push event received in SW');
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
  console.log('Message received in SW:', event.data);
  
  if (event.data && event.data.type === 'SHOW_TEST_NOTIFICATION') {
    const title = event.data.title || 'Gentlee Test Notification';
    const message = event.data.message || 'This is a test notification from the service worker.';
    
    try {
      self.registration.showNotification(title, {
        body: message,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        data: {
          url: '/chat',
          type: 'test'
        }
      }).then(() => {
        // Notify client that notification was shown
        event.source.postMessage({
          type: 'NOTIFICATION_SHOWN',
          success: true
        });
      }).catch(error => {
        console.error('Error showing notification:', error);
        // Notify client about the error
        event.source.postMessage({
          type: 'NOTIFICATION_ERROR',
          error: error.message
        });
      });
    } catch (error) {
      console.error('Error in showNotification:', error);
      // Notify client about the error
      event.source.postMessage({
        type: 'NOTIFICATION_ERROR',
        error: error.message
      });
    }
  } else if (event.data && event.data.type === 'CHECK_PERMISSION') {
    // Check if we can show notifications (service worker context)
    event.source.postMessage({
      type: 'PERMISSION_STATUS',
      permission: 'granted' // Service worker can always show notifications if registered
    });
  } else if (event.data && event.data.type === 'PING') {
    // Simple ping to check if service worker is active
    event.source.postMessage({
      type: 'PONG',
      timestamp: new Date().toISOString()
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
