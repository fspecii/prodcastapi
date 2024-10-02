import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

let db: any;

async function openDb() {
  if (!db) {
    db = await open({
      filename: './myvideos.sqlite',
      driver: sqlite3.Database
    });
    await db.exec(`
      CREATE TABLE IF NOT EXISTS videos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        filename TEXT,
        transcription_path TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        published BOOLEAN DEFAULT FALSE,
        scheduled BOOLEAN DEFAULT FALSE,
        status TEXT DEFAULT 'processing',
        video_url TEXT,
        title TEXT,
        description TEXT,
        scheduled_date TEXT,
        render_progress REAL
      )
    `);
    
    // Add columns if they don't exist
    const tableInfo = await db.all("PRAGMA table_info(videos)");
    const columns = ['title', 'description', 'scheduled_date', 'render_progress'];
    for (const column of columns) {
      if (!tableInfo.some(col => col.name === column)) {
        let dataType = 'TEXT';
        if (column === 'render_progress') {
          dataType = 'REAL';
        }
        await db.exec(`ALTER TABLE videos ADD COLUMN ${column} ${dataType}`);
      }
    }
    
    await db.exec(`
      CREATE TABLE IF NOT EXISTS bulk_videos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        youtube_url TEXT,
        status TEXT DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
  }
  return db;
}

export async function getVideos() {
  const db = await openDb();
  return db.all('SELECT * FROM videos ORDER BY created_at DESC');
}

export async function addVideo(filename: string, transcriptionPath: string, status: string = 'processing') {
  const db = await openDb();
  return db.run('INSERT INTO videos (filename, transcription_path, status) VALUES (?, ?, ?)', filename, transcriptionPath, status);
}

export async function updateVideoMetadata(
  id: number,
  title: string,
  description: string
) {
  const db = await openDb();
  return db.run('UPDATE videos SET title = ?, description = ? WHERE id = ?', title, description, id);
}

export async function updateVideoStatus(
  id: number, 
  status?: string, 
  videoUrl?: string | null,
  published?: boolean,
  scheduled?: boolean,
  title?: string,
  description?: string,
  scheduledDate?: string,
  renderProgress?: number
) {
  const db = await openDb();
  let query = 'UPDATE videos SET';
  const params = [];

  if (status !== undefined) {
    query += ' status = ?,';
    params.push(status);
  }
  if (videoUrl !== undefined) {
    query += ' video_url = ?,';
    params.push(videoUrl);
  }
  if (published !== undefined) {
    query += ' published = ?,';
    params.push(published);
  }
  if (scheduled !== undefined) {
    query += ' scheduled = ?,';
    params.push(scheduled);
  }
  if (title !== undefined) {
    query += ' title = ?,';
    params.push(title);
  }
  if (description !== undefined) {
    query += ' description = ?,';
    params.push(description);
  }
  if (scheduledDate !== undefined) {
    query += ' scheduled_date = ?,';
    params.push(scheduledDate);
  }
  if (renderProgress !== undefined) {
    query += ' render_progress = ?,';
    params.push(renderProgress);
  }

  // Remove the trailing comma
  query = query.slice(0, -1);

  query += ' WHERE id = ?';
  params.push(id);

  return db.run(query, ...params);
}

export async function deleteVideo(id: number) {
  const db = await openDb();
  return db.run('DELETE FROM videos WHERE id = ?', id);
}

export async function getVideoTranscriptionPath(id: number) {
  const db = await openDb();
  const result = await db.get('SELECT transcription_path FROM videos WHERE id = ?', id);
  return result ? result.transcription_path : null;
}

export async function getVideoById(id: number) {
  const db = await openDb();
  return db.get('SELECT * FROM videos WHERE id = ?', id);
}

export async function getScheduledVideos() {
  const db = await openDb();
  const now = new Date().toISOString();
  return db.all('SELECT * FROM videos WHERE scheduled = TRUE AND scheduled_date <= ? AND status = "scheduled"', now);
}

export async function addBulkVideo(youtubeUrl: string, status: string = 'pending') {
  const db = await openDb();
  return db.run('INSERT INTO bulk_videos (youtube_url, status) VALUES (?, ?)', youtubeUrl, status);
}

export async function updateBulkVideoStatus(id: number, status: string) {
  const db = await openDb();
  return db.run('UPDATE bulk_videos SET status = ? WHERE id = ?', status, id);
}

export async function getPendingBulkVideos() {
  const db = await openDb();
  return db.all('SELECT * FROM bulk_videos WHERE status = "pending" ORDER BY created_at ASC LIMIT 1');
}