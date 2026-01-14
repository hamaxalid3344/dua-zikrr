// api/send-notification.js - ناردنی نۆتیفیکەیشن بۆ هەموو بەشداربووان

const webpush = require('web-push');

// VAPID keys - ئەمانە لە environment variables دێن
const vapidKeys = {
    publicKey: process.env.VAPID_PUBLIC_KEY,
    privateKey: process.env.VAPID_PRIVATE_KEY
};

webpush.setVapidDetails(
    'hamaxalid3344@gmail.com', // ئیمەیڵەکەت
    vapidKeys.publicKey,
    vapidKeys.privateKey
);

export default async function handler(req, res) {
    // تەنها POST پەسەند بکە
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        // هێنانی هەموو subscriptions
        // لە production دا، ئەمە لە دیتابەیس یان KV storage دێت
        const subscriptions = []; // ئەمە دەبێت لە دیتابەیس بهێنیت

        if (subscriptions.length === 0) {
            return res.status(200).json({ 
                message: 'No subscribers to send notifications to' 
            });
        }

        // ناردنی نۆتیفیکەیشن بۆ هەموو بەشداربووان
        const notificationPromises = subscriptions.map(subscription => {
            return webpush.sendNotification(subscription, message)
                .catch(error => {
                    console.error('Error sending notification:', error);
                    // ئەگەر subscription نەگونجاو بوو، لابەرە
                    if (error.statusCode === 410) {
                        // لابردنی subscription لە دیتابەیس
                        console.log('Removing expired subscription');
                    }
                });
        });

        await Promise.all(notificationPromises);

        return res.status(200).json({ 
            success: true, 
            message: 'Notifications sent successfully',
            count: subscriptions.length
        });

    } catch (error) {
        console.error('Error in send-notification:', error);
        return res.status(500).json({ 
            error: 'Internal server error',
            message: error.message 
        });
    }
}

// کرۆن جۆب بۆ ناردنی نۆتیفیکەیشنی ڕۆژانە
// دەتوانیت لە Vercel Cron Jobs بەکاری بهێنیت
// vercel.json:
// {
//   "crons": [{
//     "path": "/api/send-daily-notification",
//     "schedule": "0 9 * * *"
//   }]
// }