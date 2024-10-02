import Queue from 'bull';

export const videoQueue = new Queue('video-publishing', {
  redis: {
    port: 6379,
    host: '127.0.0.1',
    // Add any other Redis configuration as needed
  }
});