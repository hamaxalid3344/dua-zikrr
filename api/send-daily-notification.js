const webpush = require('web-push');

const vapidKeys = {
    publicKey: process.env.VAPID_PUBLIC_KEY,
    privateKey: process.env.VAPID_PRIVATE_KEY
};

webpush.setVapidDetails(
    `mailto:${process.env.YOUR_EMAIL}`,
    vapidKeys.publicKey,
    vapidKeys.privateKey
);

export default async function handler(req, res) {
    try {
        // هێنانی subscriptions لە دیتابەیس
        const subscriptions = []; // ئەمە لە دیتابەیس بهێنە

        const message = JSON.stringify({
            title: 'پاڕانەوەکانم 🤲',
            body: 'یادەوەریەکی نوێت هەیە! کاتی زیکرە 🌟',
            icon: '/images/logo.png',
            url: '/'
        });

        const promises = subscriptions.map(sub => 
            webpush.sendNotification(sub, message)
                .catch(err => console.error('Error:', err))
        );

        await Promise.all(promises);

        return res.status(200).json({ 
            success: true,
            sent: subscriptions.length 
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}