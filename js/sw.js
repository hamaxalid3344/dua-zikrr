// Service Worker بۆ وەرگرتنی نۆتیفیکەیشنەکان
self.addEventListener('push', function(event) {
    const options = {
        body: event.data ? event.data.text() : 'یادەوەریەکی نوێت هەیە!',
        icon: '/images/logo.png',
        badge: '/images/logo.png',
        vibrate: [200, 100, 200],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'explore',
                title: 'کردنەوە',
                icon: '/images/logo.png'
            },
            {
                action: 'close',
                title: 'داخستن'
            }
        ],
        requireInteraction: false,
        tag: 'notification-tag',
        renotify: true
    };

    event.waitUntil(
        self.registration.showNotification('پاڕانەوەکانم 🤲', options)
    );
});

self.addEventListener('notificationclick', function(event) {
    event.notification.close();

    if (event.action === 'explore') {
        event.waitUntil(
            clients.openWindow('/')
        );
    } else if (event.action === 'close') {
        event.notification.close();
    } else {
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

self.addEventListener('install', function(event) {
    self.skipWaiting();
});

self.addEventListener('activate', function(event) {
    event.waitUntil(clients.claim());
});