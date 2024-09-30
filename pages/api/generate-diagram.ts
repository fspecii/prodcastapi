import { NextApiRequest, NextApiResponse } from 'next';
import { createCanvas, loadImage } from 'canvas';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { diagramDescription } = req.body;

  if (!diagramDescription) {
    return res.status(400).json({ error: 'Missing diagram description' });
  }

  try {
    const canvas = createCanvas(800, 600);
    const ctx = canvas.getContext('2d');

    // Set transparent background
    ctx.clearRect(0, 0, 800, 600);

    // Draw diagram title
    ctx.font = 'bold 24px Arial';
    ctx.fillStyle = '#FFD700';
    ctx.fillText(diagramDescription.title, 20, 40);

    // Draw diagram elements
    ctx.font = '18px Arial';
    ctx.fillStyle = '#FFFFFF';
    diagramDescription.elements.forEach((el: any, index: number) => {
      const y = 80 + index * 40;
      ctx.fillText(el.text, 20, y);
      
      if (el.connections.length > 0) {
        ctx.fillStyle = '#FFD700';
        ctx.fillText(`→ ${el.connections.join(', ')}`, 400, y);
        ctx.fillStyle = '#FFFFFF';
      }
    });

    const sessionId = uuidv4();
    const outputDir = path.join(process.cwd(), 'public', 'temp', sessionId);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const fileName = `diagram_${Date.now()}.png`;
    const filePath = path.join(outputDir, fileName);

    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(filePath, buffer);

    res.status(200).json({ diagramUrl: `/temp/${sessionId}/${fileName}` });
  } catch (error) {
    console.error('Error generating diagram:', error);
    res.status(500).json({ error: 'Error generating diagram' });
  }
}