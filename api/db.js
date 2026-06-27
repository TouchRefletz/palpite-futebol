import { createClient } from '@vercel/kv';
import fs from 'fs/promises';
import fsSync from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env file manually if it exists
try {
  const envPath = path.join(__dirname, '../.env');
  if (fsSync.existsSync(envPath)) {
    const envConfig = fsSync.readFileSync(envPath, 'utf-8');
    envConfig.split('\n').forEach(line => {
      const parts = line.split('=');
      if (parts.length >= 2) {
        const key = parts[0].trim();
        let val = parts.slice(1).join('=').trim();
        // Remove quotes if present
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.substring(1, val.length - 1);
        }
        if (key && !process.env[key]) {
          process.env[key] = val;
        }
      }
    });
    console.log('Loaded environment variables from local .env file.');
  }
} catch (e) {
  console.error('Failed to load local .env file:', e);
}

let kv;
if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
  try {
    kv = createClient({
      url: process.env.KV_REST_API_URL,
      token: process.env.KV_REST_API_TOKEN,
    });
    console.log('Vercel KV client initialized successfully.');
  } catch (e) {
    console.error('Failed to initialize Vercel KV client:', e);
  }
} else {
  console.log('Vercel KV credentials not found. Using local JSON database (data/db.json).');
}

const LOCAL_DB_PATH = path.join(__dirname, '../data/db.json');

export async function getData() {
  if (kv) {
    try {
      const data = await kv.get('bolao_data');
      return data || { matches: [], guesses: [], users: [] };
    } catch (error) {
      console.error('Error reading from Vercel KV:', error);
    }
  }

  // Fallback to local JSON
  try {
    const content = await fs.readFile(LOCAL_DB_PATH, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    return { matches: [], guesses: [], users: [] };
  }
}

export async function saveData(data) {
  if (kv) {
    try {
      await kv.set('bolao_data', data);
      return;
    } catch (error) {
      console.error('Error writing to Vercel KV:', error);
    }
  }

  // Save to local JSON
  try {
    await fs.mkdir(path.dirname(LOCAL_DB_PATH), { recursive: true });
    await fs.writeFile(LOCAL_DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error writing to local JSON file:', error);
  }
}

// Queue for sequential database operations to prevent concurrent write conflicts
let dbLock = Promise.resolve();

export async function runExclusive(callback) {
  const nextLock = dbLock.then(async () => {
    try {
      return await callback();
    } catch (e) {
      console.error("Error inside db exclusive execution:", e);
      throw e;
    }
  });
  dbLock = nextLock.then(() => {}, () => {}); // Continue chain even if callback fails
  return nextLock;
}

export async function getLock(key, ttlSeconds) {
  if (kv) {
    try {
      const result = await kv.set(key, '1', { nx: true, ex: ttlSeconds });
      return result === 'OK' || result === true;
    } catch (error) {
      console.error('Error with lock on Vercel KV:', error);
    }
  }

  // Local fallback using runExclusive for atomicity
  return await runExclusive(async () => {
    try {
      const db = await getData();
      const now = Date.now();
      if (db.locks && db.locks[key] && db.locks[key] > now) {
        return false;
      }
      if (!db.locks) db.locks = {};
      db.locks[key] = now + ttlSeconds * 1000;
      await saveData(db);
      return true;
    } catch (error) {
      console.error('Error with local lock:', error);
      return false;
    }
  });
}

export async function releaseLock(key) {
  if (kv) {
    try {
      await kv.del(key);
      return;
    } catch (error) {
      console.error('Error releasing lock on Vercel KV:', error);
    }
  }
  
  try {
    const db = await getData();
    if (db.locks && db.locks[key]) {
      delete db.locks[key];
      await saveData(db);
    }
  } catch (error) {
    console.error('Error releasing local lock:', error);
  }
}

