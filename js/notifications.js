// notifications.js - سیستەمی نۆتیفیکەیشن

const VAPID_PUBLIC_KEY = 'BJ0HChCx2Ook8VhIY6jvfWAExMGGvMbrtbdJeK1QgtWzFQ7QYwfYXAQH0QaEiJva9-naIPV3d0gUbpo-zyaUMzdY'; // دوای دروستکردنی VAPID Keys ئەمە بگۆڕە

// گۆڕینی base64 بۆ Uint8Array
function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

// تۆمارکردن بۆ نۆتیفیکەیشن
async function subscribeUser() {
    try {
        // پشکنینی پشتیوانی
        if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
            console.log('نۆتیفیکەیشن پشتیوانی نییە');
            showToast('براوزەرەکەت پشتیوانی نۆتیفیکەیشن ناکات!', 'error');
            return;
        }

        // داواکردنی مۆڵەت
        const permission = await Notification.requestPermission();
        
        if (permission !== 'granted') {
            showToast('مۆڵەتی نۆتیفیکەیشن ڕەتکرایەوە!', 'error');
            return;
        }

        // تۆمارکردنی Service Worker
        const registration = await navigator.serviceWorker.register('/sw.js');
        await navigator.serviceWorker.ready;

        // دروستکردنی subscription
        const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
        });

        // ناردنی subscription بۆ سێرڤەر
        const response = await fetch('/api/subscribe', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(subscription)
        });

        if (response.ok) {
            localStorage.setItem('notificationSubscribed', 'true');
            updateNotificationButton(true);
            showToast('بەسەرکەوتوویی تۆمارکرا بۆ نۆتیفیکەیشن! 🔔', 'success');
        } else {
            throw new Error('تۆمارکردن سەرکەوتوو نەبوو');
        }

    } catch (error) {
        console.error('هەڵە لە تۆمارکردن:', error);
        showToast('هەڵەیەک ڕوویدا لە تۆمارکردن!', 'error');
    }
}

// لابردنی تۆمارکردن
async function unsubscribeUser() {
    try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        
        if (subscription) {
            await subscription.unsubscribe();
            
            // ناردنی داواکاری لابردن بۆ سێرڤەر
            await fetch('/api/unsubscribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(subscription)
            });

            localStorage.removeItem('notificationSubscribed');
            updateNotificationButton(false);
            showToast('تۆمارکردن لابرا! 🔕', 'success');
        }
    } catch (error) {
        console.error('هەڵە لە لابردنی تۆمارکردن:', error);
        showToast('هەڵەیەک ڕوویدا!', 'error');
    }
}

// نوێکردنەوەی دوگمە
function updateNotificationButton(isSubscribed) {
    const btn = document.getElementById('notificationBtn');
    if (!btn) return;

    if (isSubscribed) {
        btn.innerHTML = '<i class="fas fa-bell-slash ml-2"></i> لابردنی یادەوەری';
        btn.classList.remove('from-indigo-500', 'to-purple-600');
        btn.classList.add('from-red-500', 'to-pink-600');
        btn.onclick = unsubscribeUser;
    } else {
        btn.innerHTML = '<i class="fas fa-bell ml-2"></i> یادەوەری ڕۆژانە';
        btn.classList.remove('from-red-500', 'to-pink-600');
        btn.classList.add('from-indigo-500', 'to-purple-600');
        btn.onclick = subscribeUser;
    }
}

// پشکنینی تۆمارکردن کاتی بارکردن
async function checkSubscription() {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
        try {
            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.getSubscription();
            updateNotificationButton(!!subscription);
        } catch (error) {
            console.error('هەڵە لە پشکنینی subscription:', error);
        }
    }
}

// نیشاندانی Toast
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    
    if (toast && toastMessage) {
        toastMessage.textContent = message;
        toast.classList.add('show');
        
        if (type === 'error') {
            toast.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
        } else {
            toast.style.background = 'linear-gradient(135deg, #6366f1, #a855f7)';
        }
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
}

// دەستپێکردن کاتی بارکردن
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkSubscription);
} else {
    checkSubscription();
}