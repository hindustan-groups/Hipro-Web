const fs = require('fs');
const path = require('path');

const DB_FUNCTIONS = ['findAll', 'insertOne', 'updateOne', 'deleteOne', 'findById'];
const TARGET_DIRS = [
  path.join(__dirname, '../app/api'),
  path.join(__dirname, '../app/(site)')
];

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  let original = content;

  // Pattern to find calls to our db functions that don't have 'await' before them
  DB_FUNCTIONS.forEach(fn => {
    // Look for fn( ... ) and not preceded by await
    const regex = new RegExp(`(?<!await\\s+)(?<!function\\s+)(?<!export\\s+const\\s+)(${fn}(?:<[^>]+>)?\\()`, 'g');
    content = content.replace(regex, 'await $1');
  });

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`Updated ${filePath}`);
  }
}

function walkDir(dir) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
      processFile(fullPath);
    }
  }
}

TARGET_DIRS.forEach(walkDir);
console.log("Done adding awaits!");
