// =============================================================================
// Environment Setup Script
// =============================================================================
// Automatically copies .env.example to .env.local and .env if they don't exist
// Runs during postinstall to ensure environment files are ready
// =============================================================================

const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function ensureEnvFile() {
  const envPath = path.join(process.cwd(), '.env');
  const envLocalPath = path.join(process.cwd(), '.env.local');
  const envExamplePath = path.join(process.cwd(), '.env.example');
  
  // Check .env.example exists
  if (!fs.existsSync(envExamplePath)) {
    log('⚠ .env.example not found - skipping environment setup', colors.yellow);
    return;
  }
  
  const created = [];
  
  // Ensure .env.local exists (for Next.js)
  if (!fs.existsSync(envLocalPath)) {
    fs.copyFileSync(envExamplePath, envLocalPath);
    created.push('.env.local');
  }
  
  // Ensure .env exists (for Prisma CLI)
  if (!fs.existsSync(envPath)) {
    fs.copyFileSync(envExamplePath, envPath);
    created.push('.env');
  }
  
  if (created.length > 0) {
    log(`✓ Created ${created.join(' and ')} from .env.example`, colors.green);
    log('  Remember to update these files with your actual credentials!', colors.cyan);
  }
}

ensureEnvFile();
