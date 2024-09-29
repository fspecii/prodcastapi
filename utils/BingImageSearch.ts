import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { URLSearchParams } from 'url';

export class BingImageSearch {
  private downloadCount: number = 0;
  private seen: Set<string> = new Set();
  private pageCounter: number = 0;

  constructor(
    private query: string,
    private limit: number,
    private outputDir: string,
    private adult: string,
    private timeout: number,
    private filter: string = '',
    private verbose: boolean = true
  ) {}

  private async saveImage(link: string, filePath: string): Promise<void> {
    try {
      const response = await axios.get(link, {
        responseType: 'arraybuffer',
        timeout: this.timeout * 1000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        },
      });

      fs.writeFileSync(filePath, response.data);
      if (this.verbose) {
        console.log(`[%] File Downloaded: ${filePath}`);
      }
    } catch (error) {
      console.error(`[Error] Failed to save image: ${link}`, error);
      throw error;
    }
  }

  private async downloadImage(link: string): Promise<string | null> {
    this.downloadCount++;
    try {
      const parsedUrl = new URL(link);
      let filename = path.basename(parsedUrl.pathname).split('?')[0];
      let fileType = path.extname(filename).slice(1).toLowerCase();

      if (!['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(fileType)) {
        fileType = 'jpg';
      }

      const imageName = `Image_${this.downloadCount}_${Date.now()}.${fileType}`;
      const filePath = path.join(this.outputDir, imageName);

      if (this.verbose) {
        console.log(`[%] Downloading Image #${this.downloadCount} from ${link}`);
      }

      await this.saveImage(link, filePath);
      return imageName;
    } catch (error) {
      this.downloadCount--;
      console.error(`[!] Issue getting: ${link}\n[!] Error:: ${error}`);
      return null;
    }
  }

  async run(): Promise<string[]> {
    const downloadedImages: string[] = [];

    while (this.downloadCount < this.limit) {
      if (this.verbose) {
        console.log(`\n\n[!!]Indexing page: ${this.pageCounter + 1}\n`);
      }

      const params = new URLSearchParams({
        q: this.query,
        first: this.pageCounter.toString(),
        count: this.limit.toString(),
        adlt: this.adult,
        qft: this.filter,
      });

      const requestUrl = `https://www.bing.com/images/async?${params.toString()}`;

      try {
        const response = await axios.get(requestUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          },
        });

        const html = response.data;
        if (html === "") {
          console.log("[%] No more images are available");
          break;
        }

        const linkRegex = /murl&quot;:&quot;(.*?)&quot;/g;
        const links = [];
        let match;
        while ((match = linkRegex.exec(html)) !== null) {
          links.push(match[1]);
        }

        if (this.verbose) {
          console.log(`[%] Indexed ${links.length} Images on Page ${this.pageCounter + 1}.`);
          console.log("\n===============================================\n");
        }

        for (const link of links) {
          if (this.downloadCount < this.limit && !this.seen.has(link)) {
            this.seen.add(link);
            const downloadedImage = await this.downloadImage(link);
            if (downloadedImage) {
              downloadedImages.push(downloadedImage);
            }
          }
        }

        this.pageCounter++;
      } catch (error) {
        console.error('Error fetching images:', error);
        break;
      }
    }

    console.log(`\n\n[%] Done. Downloaded ${this.downloadCount} images.`);
    return downloadedImages;
  }
}