import { NextApiRequest, NextApiResponse } from 'next';
import { addBulkVideo } from '../../lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { urls } = req.body;

  if (!Array.isArray(urls) || urls.length === 0) {
    return res.status(400).json({ error: 'Invalid or empty URL list' });
  }

  let addedCount = 0;

  for (const url of urls) {
    try {
      await addBulkVideo(url);
      addedCount++;
    } catch (error) {
      console.error(`Error adding URL ${url} to bulk processing:`, error);
    }
  }

  res.status(200).json({ message: 'Bulk videos added to queue', addedCount });
}