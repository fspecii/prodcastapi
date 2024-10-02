import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import { updateVideoStatus, updateVideoMetadata } from '../../lib/db'; // Import updateVideoMetadata
import axios from 'axios';
import { connect } from 'puppeteer-real-browser';

const maxTitleLen = 100;
const maxDescLen = 5000;
const timeout = 60000;
const height = 900;
const width = 900;
const uploadURL = 'https://www.youtube.com/upload?persist_gl=1&gl=US&persist_hl=1&hl=en';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id, filename } = req.body;

  if (!id || !filename) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  const succeededSteps: string[] = [];

  try {
    console.log('1. Starting video upload process');
    succeededSteps.push('1. Starting video upload process');
    const videoPath = path.join(process.cwd(), 'public', 'videos', filename);

    if (!fs.existsSync(videoPath)) {
      console.log('Error: Video file not found');
      return res.status(404).json({ error: 'Video file not found' });
    }

    console.log('2. Generating metadata');
    let metadataRes;
    try {
      metadataRes = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/generate-metadata`, {
        videoId: id
      });
      succeededSteps.push('2. Generating metadata');
    } catch (error) {
      console.error('Error generating metadata:', error);
      return res.status(500).json({ error: 'Failed to generate metadata' });
    }

    if (!metadataRes || metadataRes.status !== 200 || !metadataRes.data.title || !metadataRes.data.description) {
      console.log('Error: Failed to generate valid metadata');
      throw new Error('Failed to generate valid metadata');
    }

    const { title, description } = metadataRes.data;
    console.log('3. Metadata generated successfully');
    succeededSteps.push('3. Metadata generated successfully');

    // Save the generated metadata to the database
    try {
      await updateVideoMetadata(id, title, description);
      console.log('4. Metadata saved to database');
      succeededSteps.push('4. Metadata saved to database');
    } catch (error) {
      console.error('Error saving metadata to database:', error);
      throw new Error('Failed to save metadata to database');
    }

    console.log('4. Launching browser');
    const { browser, page } = await connect({
      customConfig: {
        chromePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      },
      headless: false,
    });
    succeededSteps.push('4. Launching browser');

    try {
      console.log('5. Setting viewport');
      await page.setViewport({ width, height });
      succeededSteps.push('5. Setting viewport');

      console.log('6. Loading cookies');
      const cookieFile = path.join(process.cwd(), 'studio.youtube.com.cookies.json');
      const cookiesString = fs.readFileSync(cookieFile, 'utf8');
      const cookies = JSON.parse(cookiesString);
      await page.setCookie(...cookies);
      succeededSteps.push('6. Loading cookies');

      console.log('7. Navigating to YouTube upload page');
      await page.goto(uploadURL);
      succeededSteps.push('7. Navigating to YouTube upload page');

      console.log('8. Waiting for file input');
      const selectBtnPath = "#select-files-button > ytcp-button-shape > button > div";
      await page.waitForSelector(selectBtnPath);
      const selectBtn = await page.$$(selectBtnPath);
      const [fileChooser] = await Promise.all([
        page.waitForFileChooser(),
        selectBtn[0].click()
      ]);
      await fileChooser.accept([videoPath]);
      succeededSteps.push('8. Waiting for file input');

      console.log('9. Setting title and description');
      await page.waitForFunction('document.querySelectorAll(\'[id="textbox"]\').length > 1');
      const textBoxes = await page.$$("xpath/.//*[@id='textbox']");
      await textBoxes[0].focus();
      await textBoxes[0].evaluate((e: any) => (e.__shady_native_textContent = ''));
      await textBoxes[0].type(title.substring(0, maxTitleLen));
      await textBoxes[1].evaluate((e: any) => (e.__shady_native_textContent = ''));
      await textBoxes[1].type(description.substring(0, maxDescLen));
      succeededSteps.push('9. Setting title and description');

      console.log('10. Clicking next button three times');
      const nextButtonSelector = '#next-button > ytcp-button-shape > button > yt-touch-feedback-shape > div > div.yt-spec-touch-feedback-shape__fill';
      await page.waitForSelector(nextButtonSelector);
      
      for (let i = 0; i < 3; i++) {
        await page.click(nextButtonSelector);
        await page.waitForTimeout(1000);
      }
      
      succeededSteps.push('10. Clicking next button three times');

      console.log('11. Setting video to public');
      await page.click("tp-yt-paper-radio-button[name='VIDEO_MADE_FOR_KIDS_NOT_MFK']").catch(() => {});
      succeededSteps.push('11. Setting video to public');
      
      console.log('12. Publishing video');
      const publishXPath = "xpath/.//*[normalize-space(text())='Publish']/parent::*[not(@disabled)]";
      await page.waitForSelector(publishXPath);
      const publishBtn = await page.$$(publishXPath);
      await publishBtn[0].click();
      succeededSteps.push('12. Publishing video');

      console.log('13. Waiting for processing to complete');
      await page.waitForSelector("xpath/.//*[contains(text(),'Finished processing')]", { timeout: 0 });
      succeededSteps.push('13. Waiting for processing to complete');

      console.log('14. Getting video URL');
      const videoBaseLink = 'https://youtu.be';
      const shortVideoBaseLink = 'https://youtube.com/shorts';
      const uploadLinkSelector = `[href^="${videoBaseLink}"], [href^="${shortVideoBaseLink}"]`;
      await page.waitForSelector(uploadLinkSelector);
      const uploadedLinkHandle = await page.$(uploadLinkSelector);
      let videoUrl;
      do {
        await new Promise(resolve => setTimeout(resolve, 500));
        videoUrl = await page.evaluate((e) => e?.getAttribute('href') ?? '', uploadedLinkHandle);
      } while (videoUrl === videoBaseLink || videoUrl === shortVideoBaseLink);
      succeededSteps.push('14. Getting video URL');

      console.log('15. Video published successfully. URL:', videoUrl);
      succeededSteps.push('15. Video published successfully');

      // Update the final updateVideoStatus call to include title and description
      await updateVideoStatus(id, 'published', videoUrl, true, false, title, description);

      res.status(200).json({ success: true, videoUrl });
    } finally {
      console.log('16. Closing browser');
      await browser.close();
      succeededSteps.push('16. Closing browser');
    }
  } catch (error) {
    console.error('Error publishing video:', error);
    console.log('Succeeded steps:', succeededSteps.join(', '));
    res.status(500).json({ error: 'Failed to publish video', details: error instanceof Error ? error.message : String(error), succeededSteps });
  }
}

// Remove this function as it's now imported from lib/db.ts
// async function updateVideoMetadata(id: number, title: string, description: string) {
//   const db = await openDb();
//   return db.run('UPDATE videos SET title = ?, description = ? WHERE id = ?', title, description, id);
// }

// ... (keep other existing functions if any)