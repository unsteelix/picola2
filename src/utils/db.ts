import { join, dirname } from 'path';
import { Low, JSONFile, LowSync, JSONFileSync } from 'lowdb';

type data = {
  original: any;
  cache: any;
  files: any;
};

// Use JSON file for storage
const file = join('src/../volume', 'db.json');
const adapter = new JSONFileSync<data>(file);
const db = new LowSync(adapter);

// Read data from JSON file, this will set db.data content
db.read();

// If file.json doesn't exist, db.data will be null
// Set default data
db.data ||= {
  original: {},
  cache: {},
  files: {}
};

db.write();

export default db;
