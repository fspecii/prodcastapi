import { NextApiRequest, NextApiResponse } from 'next';
import { updateVideoStatus } from '../../lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id, progress } = req.body;

  if (!id || progress === undefined) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  try {
    await updateVideoStatus(id, undefined, undefined, undefined, undefined, undefined, undefined, undefined, progress);
    res.status(200).json({ message: 'Render progress updated successfully' });
  } catch (error) {
    console.error('Error updating render progress:', error);
    res.status(500).json({ error: 'Failed to update render progress' });
  }
}