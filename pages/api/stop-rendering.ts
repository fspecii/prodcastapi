import { NextApiRequest, NextApiResponse } from 'next';
import { updateVideoStatus } from '../../lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ error: 'Missing video ID' });
  }

  try {
    await updateVideoStatus(id, 'stopped');
    res.status(200).json({ message: 'Rendering process stopped successfully' });
  } catch (error) {
    console.error('Error stopping rendering process:', error);
    res.status(500).json({ error: 'Failed to stop rendering process' });
  }
}