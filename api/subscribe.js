import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const subscription = req.body;
        const filePath = path.join(process.cwd(), 'data', 'subscriptions.json');
        
        // خوێندنەوەی فایل
        let data = { subscriptions: [] };
        if (fs.existsSync(filePath)) {
            data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        }

        // زیادکردنی subscription نوێ
        const exists = data.subscriptions.find(
            s => s.endpoint === subscription.endpoint
        );

        if (!exists) {
            data.subscriptions.push(subscription);
            fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        }

        return res.status(200).json({ success: true });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}