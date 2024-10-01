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

export async function addVideo(filename: string) {
  const db = await openDb();
  return db.run('INSERT INTO videos (filename) VALUES (?)', filename);
}

export async function deleteVideo(id: number) {
  const db = await openDb();
  return db.run('DELETE FROM videos WHERE id = ?', id);
}