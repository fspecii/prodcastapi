import { videoQueue } from './lib/queueConfig';
import { publishVideo } from './lib/publishVideo'; // You'll need to create this function

videoQueue.process('publish-video', async (job) => {
  const { id, filename } = job.data;
  await publishVideo(id, filename);
});

console.log('Video publishing worker is running');