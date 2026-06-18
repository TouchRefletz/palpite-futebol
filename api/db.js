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
