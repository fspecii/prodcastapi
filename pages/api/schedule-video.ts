import { NextApiRequest, NextApiResponse } from 'next';
import { updateVideoStatus } from '../../lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id, filename, scheduledDate } = req.body;

  if (!id || !filename || !scheduledDate) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  try {
    console.log(`Scheduling video: ID ${id}, Filename: ${filename}, Date: ${scheduledDate}`);

    // Update the video status in the database
    await updateVideoStatus(id, 'scheduled', null, false, true, undefined, undefined, scheduledDate);
    console.log('Database updated successfully');

    res.status(200).json({ message: 'Video scheduled successfully' });
  } catch (error) {
    console.error('Error scheduling video:', error);
    res.status(500).json({ error: 'Failed to schedule video', details: error instanceof Error ? error.message : String(error) });
  }
}