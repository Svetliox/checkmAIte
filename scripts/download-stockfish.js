/**
 * Setup Stockfish for browser use
 * 
 * This script copies Stockfish files from node_modules to public/stockfish
 * during `npm install`, so they don't need to be committed to the repository.
 * 
 * The stockfish npm package includes pre-built WASM files.
 */

const fs = require('fs');
const path = require('path');

const SOURCE_DIR = path.join(process.cwd(), 'node_modules', 'stockfish', 'bin');
const DEST_DIR = path.join(process.cwd(), 'public', 'stockfish');

// Files to copy (using single-threaded version for broader browser support)
const FILES_TO_COPY = [
  { src: 'stockfish-18-single.js', dest: 'stockfish.js' },
  { src: 'stockfish-18-single.wasm', dest: 'stockfish.wasm' }
];

function copyFile(srcName, destName) {
  const srcPath = path.join(SOURCE_DIR, srcName);
  const destPath = path.join(DEST_DIR, destName);

  if (!fs.existsSync(srcPath)) {
    console.error(`  ✗ Source file not found: ${srcPath}`);
    return false;
  }

  // Create destination directory if it doesn't exist
  if (!fs.existsSync(DEST_DIR)) {
    fs.mkdirSync(DEST_DIR, { recursive: true });
  }

  // Check if destination already exists and is same size
  if (fs.existsSync(destPath)) {
    const srcStats = fs.statSync(srcPath);
    const destStats = fs.statSync(destPath);
    if (srcStats.size === destStats.size) {
      console.log(`  ✓ ${destName} already up to date (${(destStats.size / 1024 / 1024).toFixed(2)} MB)`);
      return true;
    }
  }

  // Copy file
  console.log(`  → Copying ${srcName} to ${destName}...`);
  fs.copyFileSync(srcPath, destPath);
  
  const stats = fs.statSync(destPath);
  console.log(`  ✓ ${destName} (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);
  return true;
}

function main() {
  console.log('\n📦 Setting up Stockfish chess engine...\n');

  // Check if source directory exists
  if (!fs.existsSync(SOURCE_DIR)) {
    console.error('  ✗ Stockfish npm package not found.');
    console.error('    Run: npm install stockfish\n');
    process.exit(1);
  }

  let success = true;
  for (const file of FILES_TO_COPY) {
    if (!copyFile(file.src, file.dest)) {
      success = false;
    }
  }

  if (success) {
    console.log('\n✅ Stockfish setup complete!\n');
  } else {
    console.error('\n⚠️  Some files could not be copied.\n');
    process.exit(1);
  }
}

main();
