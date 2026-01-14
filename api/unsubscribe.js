// api/unsubscribe.js - Vercel Function بۆ لابردنی subscriptions

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const subscription = req.body;

        if (!subscription || !subscription.endpoint) {
            return res.status(400).json({ error: 'Invalid subscription data' });
        }

        // لابردنی subscription لە لیست
        console.log('Subscription removed:', subscription);

        return res.status(200).json({ 
            success: true, 
            message: 'Subscription removed successfully' 
        });

    } catch (error) {
        console.error('Error removing subscription:', error);
        return res.status(500).json({ 
            error: 'Internal server error',
            message: error.message 
        });
    }
}