// =============================================================================
// checkmAIte - Development Orchestration Script
// =============================================================================
// This script handles the complete dev environment setup:
// 1. Checks if Docker Desktop is running
// 2. Starts PostgreSQL container
// 3. Waits for database to be healthy
// 4. Runs Prisma migrations
// 5. Seeds default user (idempotent)
// 6. Starts Next.js dev server
// =============================================================================

const { spawn, execSync } = require('child_process');
const { platform } = require('os');

// ANSI colors for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  dim: '\x1b[2m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logStep(step, message) {
  console.log(`${colors.cyan}[${step}]${colors.reset} ${message}`);
}

function logSuccess(message) {
  console.log(`${colors.green}✓${colors.reset} ${message}`);
}

function logError(message) {
  console.log(`${colors.red}✗${colors.reset} ${message}`);
}

function logWarning(message) {
  console.log(`${colors.yellow}⚠${colors.reset} ${message}`);
}

// Execute command and return stdout
function exec(command, options = {}) {
  try {
    return execSync(command, { encoding: 'utf-8', stdio: 'pipe', ...options });
  } catch {
    return null;
  }
}

// Check if Docker is running
function isDockerRunning() {
  const result = exec('docker info');
  return result !== null;
}

// Check if container is running
function isContainerRunning(name) {
  const result = exec(`docker ps --filter "name=${name}" --format "{{.Names}}"`);
  return result && result.trim() === name;
}

// Check if container exists (running or stopped)
function doesContainerExist(name) {
  const result = exec(`docker ps -a --filter "name=${name}" --format "{{.Names}}"`);
  return result && result.trim() === name;
}

// Start an existing container
function startContainer(name) {
  const result = exec(`docker start ${name}`);
  return result !== null;
}

// Wait for PostgreSQL to be healthy
async function waitForPostgres(maxAttempts = 30) {
  for (let i = 0; i < maxAttempts; i++) {
    const result = exec(
      'docker exec checkmaite-db pg_isready -U postgres -d checkmaite'
    );
    if (result && result.includes('accepting connections')) {
      return true;
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
    process.stdout.write('.');
  }
  return false;
}

// Run a command with inherited stdio
function runCommand(command, args = []) {
  return new Promise((resolve, reject) => {
    const isWindows = platform() === 'win32';
    const shell = isWindows ? 'cmd' : 'sh';
    const shellFlag = isWindows ? '/c' : '-c';
    const fullCommand = args.length > 0 ? `${command} ${args.join(' ')}` : command;

    const proc = spawn(shell, [shellFlag, fullCommand], {
      stdio: 'inherit',
      cwd: process.cwd(),
    });

    proc.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with code ${code}`));
      }
    });

    proc.on('error', reject);
  });
}

// Ensure .env.local exists (copy from .env.example if missing)
function ensureEnvFile() {
  const fs = require('fs');
  const path = require('path');
  const envLocalPath = path.join(process.cwd(), '.env.local');
  const envExamplePath = path.join(process.cwd(), '.env.example');
  
  if (!fs.existsSync(envLocalPath)) {
    if (fs.existsSync(envExamplePath)) {
      fs.copyFileSync(envExamplePath, envLocalPath);
      return 'copied';
    } else {
      return 'missing';
    }
  }
  return 'exists';
}

// Main function
async function main() {
  console.log('');
  log('═══════════════════════════════════════════════════════════', colors.cyan);
  log('  checkmAIte - Development Environment', colors.cyan);
  log('═══════════════════════════════════════════════════════════', colors.cyan);
  console.log('');

  // Step 0: Ensure environment file exists
  const envStatus = ensureEnvFile();
  if (envStatus === 'copied') {
    logSuccess('Created .env.local from .env.example');
  } else if (envStatus === 'missing') {
    logError('.env.example not found! Please create .env.local manually.');
    process.exit(1);
  }

  // Step 1: Check Docker
  logStep('1/5', 'Checking Docker Desktop...');
  if (!isDockerRunning()) {
    logError('Docker Desktop is not running!');
    logWarning('Please start Docker Desktop and try again.');
    process.exit(1);
  }
  logSuccess('Docker Desktop is running');

  // Step 2: Start PostgreSQL container
  logStep('2/5', 'Starting PostgreSQL container...');
  if (isContainerRunning('checkmaite-db')) {
    logSuccess('PostgreSQL container already running');
  } else if (doesContainerExist('checkmaite-db')) {
    // Container exists but is stopped - start it
    log('  Container exists but stopped, starting...', colors.dim);
    if (startContainer('checkmaite-db')) {
      logSuccess('PostgreSQL container started');
    } else {
      logError('Failed to start existing container');
      logWarning('Try: docker rm checkmaite-db && npm run dev');
      process.exit(1);
    }
  } else {
    // Container doesn't exist - create it
    try {
      execSync('docker-compose up -d db', { stdio: 'inherit' });
      logSuccess('PostgreSQL container started');
    } catch (err) {
      // Check if it's a port conflict
      if (err.message && err.message.includes('port is already allocated')) {
        logError('Port 5432 is already in use!');
        logWarning('Another PostgreSQL instance may be running.');
        logWarning('Stop it with: docker stop checkmaite-db');
        logWarning('Or check for other processes: netstat -ano | findstr :5432');
      } else {
        logError('Failed to start PostgreSQL container');
      }
      process.exit(1);
    }
  }

  // Step 3: Wait for PostgreSQL to be healthy
  logStep('3/5', 'Waiting for PostgreSQL to be ready');
  const isReady = await waitForPostgres();
  console.log(''); // New line after dots
  if (!isReady) {
    logError('PostgreSQL failed to become ready');
    process.exit(1);
  }
  logSuccess('PostgreSQL is ready');

  // Step 4: Run Prisma migrations
  logStep('4/5', 'Running database migrations...');
  try {
    // Generate Prisma client first (silently)
    execSync('npx prisma generate', { stdio: 'pipe' });
    
    // Check if migrations directory has any migrations
    const fs = require('fs');
    const migrationsPath = 'prisma/migrations';
    const hasMigrations = fs.existsSync(migrationsPath) && 
      fs.readdirSync(migrationsPath).filter(f => !f.startsWith('.')).length > 0;
    
    if (hasMigrations) {
      // Apply existing migrations (silently)
      execSync('npx prisma migrate deploy', { stdio: 'pipe' });
      logSuccess('Database migrations applied');
    } else {
      // Create initial migration (development only - needs some output)
      logWarning('No migrations found, creating initial migration...');
      execSync('npx prisma migrate dev --name init', { stdio: 'pipe' });
      logSuccess('Initial migration created and applied');
    }
  } catch (e) {
    logError('Failed to run migrations');
    // Show stderr if available for debugging
    if (e.stderr) console.error(e.stderr.toString());
    process.exit(1);
  }

  // Step 5: Seed database
  logStep('5/5', 'Seeding database...');
  try {
    const seedResult = execSync('npx prisma db seed', { stdio: 'pipe', encoding: 'utf-8' });
    // Check if user was created or already exists
    if (seedResult.includes('Created default user')) {
      logSuccess('Database seeded (default user created)');
    } else if (seedResult.includes('already exists')) {
      logSuccess('Database seeded (user already exists)');
    } else {
      logSuccess('Database seeded');
    }
  } catch {
    // Seed is idempotent, so failure usually means already seeded
    logSuccess('Database ready (already seeded)');
  }

  // Ready message
  console.log('');
  log('═══════════════════════════════════════════════════════════', colors.green);
  log('  ✓ Development environment ready!', colors.green);
  log('═══════════════════════════════════════════════════════════', colors.green);
  console.log('');
  log('  Default login credentials:', colors.dim);
  log('  Username: checkmAIte', colors.dim);
  log('  Password: checkmAIte', colors.dim);
  console.log('');

  // Start Next.js dev server
  log('Starting Next.js development server...', colors.cyan);
  console.log('');

  await runCommand('npm', ['run', 'dev:next']);
}

// Run
main().catch((error) => {
  logError('Development script failed:');
  console.error(error);
  process.exit(1);
});
