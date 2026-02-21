
import type { EngineConfig, EngineInfo, MultiPvLine } from '@/types';

let worker: Worker | null = null;
let isReady = false;
let isAnalyzingFlag = false;
let isInitializing = false; 
let messageCallback: ((info: EngineInfo) => void) | null = null;
let bestMoveCallback: ((move: string, ponder?: string) => void) | null = null;
const multiPvLines: Map<number, MultiPvLine> = new Map();

// Track page visibility to avoid issues when inactive
let isPageVisible = typeof document !== 'undefined' ? !document.hidden : true;

// Listen for visibility changes
if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    const wasHidden = !isPageVisible;
    isPageVisible = !document.hidden;
    
    // When page becomes visible again, check engine health
    if (isPageVisible && wasHidden && worker && isReady) {
      checkEngineHealth();
    }
  });
}

// Check if engine is still responsive
async function checkEngineHealth(): Promise<boolean> {
  if (!worker || !isReady) return false;
  
  const currentWorker = worker;
  
  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      console.warn('[Stockfish] Engine health check failed, will reinitialize on next use');
      cleanupWorker();
      resolve(false);
    }, 5000);
    
    const originalHandler = currentWorker.onmessage;
    currentWorker.onmessage = (event) => {
      const line = typeof event.data === 'string' ? event.data : event.data?.toString();
      if (line === 'readyok') {
        clearTimeout(timeout);
        currentWorker.onmessage = originalHandler;
        resolve(true);
        return;
      }
      // Forward other messages to original handler
      if (originalHandler) {
        originalHandler.call(currentWorker, event);
      }
    };
    
    currentWorker.postMessage('isready');
  });
}

const DEFAULT_CONFIG: EngineConfig = {
  depth: 20,
  multiPv: 3,
  threads: 1,
  hashSize: 16,
};

let currentConfig: EngineConfig = { ...DEFAULT_CONFIG };

function parseInfoLine(line: string): EngineInfo | null {
  if (!line.startsWith('info ')) return null;

  const info: EngineInfo = {
    depth: 0,
    score: 0,
    pv: [],
  };

  const depthMatch = line.match(/\bdepth (\d+)/);
  if (depthMatch) info.depth = parseInt(depthMatch[1], 10);

  const seldepthMatch = line.match(/\bseldepth (\d+)/);
  if (seldepthMatch) info.seldepth = parseInt(seldepthMatch[1], 10);

  const cpMatch = line.match(/\bscore cp (-?\d+)/);
  if (cpMatch) {
    info.score = parseInt(cpMatch[1], 10);
  }
  const mateMatch = line.match(/\bscore mate (-?\d+)/);
  if (mateMatch) {
    info.mate = parseInt(mateMatch[1], 10);
    info.score = info.mate > 0 ? 10000 - (info.mate * 10) : -10000 + (info.mate * -10);
  }

  const nodesMatch = line.match(/\bnodes (\d+)/);
  if (nodesMatch) info.nodes = parseInt(nodesMatch[1], 10);

  const npsMatch = line.match(/\bnps (\d+)/);
  if (npsMatch) info.nps = parseInt(npsMatch[1], 10);

  const timeMatch = line.match(/\btime (\d+)/);
  if (timeMatch) info.time = parseInt(timeMatch[1], 10);

  const multipvMatch = line.match(/\bmultipv (\d+)/);
  if (multipvMatch) info.multipv = parseInt(multipvMatch[1], 10);

  const pvMatch = line.match(/\bpv (.+)$/);
  if (pvMatch) {
    info.pv = pvMatch[1].split(' ').filter(m => m.length >= 4);
  }

  if (info.depth > 0 || info.pv.length > 0) {
    return info;
  }

  return null;
}

function parseBestMoveLine(line: string): { bestMove: string; ponder?: string } | null {
  if (!line.startsWith('bestmove ')) return null;

  const parts = line.split(' ');
  const bestMove = parts[1];
  const ponderIndex = parts.indexOf('ponder');
  const ponder = ponderIndex > 0 ? parts[ponderIndex + 1] : undefined;

  return { bestMove, ponder };
}

function handleMessage(event: MessageEvent): void {
  const line = typeof event.data === 'string' ? event.data : event.data?.toString();
  
  if (!line) return;

  if (line === 'readyok') {
    isReady = true;
    return;
  }

  if (line === 'uciok') {
    return;
  }

  const info = parseInfoLine(line);
  if (info && messageCallback) {
    // Store multi-PV line
    const pvRank = info.multipv || 1;
    if (info.pv.length > 0) {
      multiPvLines.set(pvRank, {
        rank: pvRank,
        moves: info.pv,
        sanMoves: [],
        score: info.score,
        mate: info.mate,
        depth: info.depth,
      });
    }
    messageCallback(info);
  }

  const bestMove = parseBestMoveLine(line);
  if (bestMove && bestMoveCallback) {
    bestMoveCallback(bestMove.bestMove, bestMove.ponder);
  }
}

function cleanupWorker(): void {
  if (worker) {
    try {
      worker.terminate();
    } catch {
      // Ignore termination errors
    }
    worker = null;
  }
  isReady = false;
  isInitializing = false;
  isAnalyzingFlag = false;
  multiPvLines.clear();
}

export async function initStockfish(config?: Partial<EngineConfig>): Promise<void> {
  // If worker exists and is ready, return immediately
  if (worker && isReady) {
    console.log('[Stockfish] Already initialized and ready');
    return;
  }
  
  // If worker exists but not ready yet, wait for it (but with recovery)
  if (worker && !isReady && isInitializing) {
    console.log('[Stockfish] Already initializing, waiting for ready...');
    return new Promise((resolve, reject) => {
      let elapsed = 0;
      const checkInterval = 100;
      const maxWait = 30000; // 30 seconds max wait for existing init
      
      const readyCheck = setInterval(() => {
        elapsed += checkInterval;
        
        if (isReady) {
          clearInterval(readyCheck);
          console.log('[Stockfish] Engine ready (waited)');
          resolve();
          return;
        }
        
        // If we've waited too long, clean up and try fresh init
        if (elapsed >= maxWait) {
          clearInterval(readyCheck);
          console.log('[Stockfish] Waited too long, restarting initialization...');
          cleanupWorker();
          // Try fresh init
          initStockfish(config).then(resolve).catch(reject);
        }
      }, checkInterval);
    });
  }
  
  // If worker exists but init flag is false, it's a stuck state - clean up
  if (worker && !isReady && !isInitializing) {
    console.log('[Stockfish] Found stuck worker, cleaning up...');
    cleanupWorker();
  }

  if (config) {
    currentConfig = { ...currentConfig, ...config };
  }

  isInitializing = true;

  return new Promise((resolve, reject) => {
    try {
      // Don't initialize if page is hidden - defer until visible
      if (!isPageVisible) {
        console.log('[Stockfish] Page hidden, deferring initialization...');
        isInitializing = false;
        
        const visibilityHandler = () => {
          if (!document.hidden) {
            document.removeEventListener('visibilitychange', visibilityHandler);
            initStockfish(config).then(resolve).catch(reject);
          }
        };
        document.addEventListener('visibilitychange', visibilityHandler);
        return;
      }
      
      worker = new Worker('/stockfish/stockfish.js');
      
      const timeout = setTimeout(() => {
        console.warn('[Stockfish] Initialization timeout, cleaning up (will retry on next use)...');
        cleanupWorker();
        // Resolve instead of reject - next call will try fresh init
        resolve();
      }, 60000);

      const initHandler = (event: MessageEvent) => {
        const line = typeof event.data === 'string' ? event.data : event.data?.toString();
        
        if (!line) return;
        
        // When we receive 'readyok', engine is fully initialized
        if (line === 'readyok') {
          isReady = true;
          isInitializing = false;
          clearTimeout(timeout);
          
          // Switch to normal message handler
          if (worker) {
            worker.onmessage = handleMessage;
            worker.onerror = (e) => {
              console.error('[Stockfish] Worker error:', e);
            };
          }
          
          // Configure engine options
          worker?.postMessage(`setoption name MultiPV value ${currentConfig.multiPv}`);
          worker?.postMessage(`setoption name Hash value ${currentConfig.hashSize}`);
          
          console.log('[Stockfish] Engine ready');
          resolve();
          return;
        }
        
        // When we receive 'uciok', engine UCI mode is active, now check if ready
        if (line === 'uciok') {
          worker?.postMessage('isready');
          return;
        }
        
        // Handle other UCI messages during init
        handleMessage(event);
      };
      
      worker.onmessage = initHandler;
      worker.onerror = (e) => {
        console.error('[Stockfish] Worker error:', e);
        clearTimeout(timeout);
        cleanupWorker();
        reject(new Error('Failed to load Stockfish worker: ' + (e.message || 'Unknown error')));
      };

      worker.postMessage('uci');
    } catch (error) {
      cleanupWorker();
      reject(error);
    }
  });
}

export function analyzePosition(
  fen: string,
  depth: number = currentConfig.depth,
  onInfo?: (info: EngineInfo) => void,
  onBestMove?: (move: string, ponder?: string) => void
): void {
  if (!worker || !isReady) {
    throw new Error('Stockfish not initialized');
  }

  multiPvLines.clear();
  isAnalyzingFlag = true;
  
  messageCallback = onInfo || null;
  bestMoveCallback = (move: string, ponder?: string) => {
    isAnalyzingFlag = false;
    onBestMove?.(move, ponder);
  };

  worker.postMessage(`position fen ${fen}`);
  worker.postMessage(`go depth ${depth}`);
}

export function stopAnalysis(): void {
  if (worker) {
    worker.postMessage('stop');
    messageCallback = null;
    bestMoveCallback = null;
    isAnalyzingFlag = false;
  }
}

export function isCurrentlyAnalyzing(): boolean {
  return isAnalyzingFlag;
}

export function getMultiPvLines(): MultiPvLine[] {
  return Array.from(multiPvLines.values()).sort((a, b) => a.rank - b.rank);
}

export function isEngineReady(): boolean {
  return isReady && worker !== null;
}

export function terminateStockfish(): void {
  if (worker) {
    worker.terminate();
    worker = null;
    isReady = false;
    messageCallback = null;
    bestMoveCallback = null;
    multiPvLines.clear();
    console.log('[Stockfish] Engine terminated');
  }
}

export function setStockfishConfig(config: Partial<EngineConfig>): void {
  currentConfig = { ...currentConfig, ...config };
  
  if (worker && isReady) {
    if (config.multiPv !== undefined) {
      worker.postMessage(`setoption name MultiPV value ${config.multiPv}`);
    }
    if (config.hashSize !== undefined) {
      worker.postMessage(`setoption name Hash value ${config.hashSize}`);
    }
    console.log('[Stockfish] Config updated:', currentConfig);
  }
}

export function getStockfishConfig(): EngineConfig {
  return { ...currentConfig };
}

export function analyzeToBestMove(
  fen: string,
  depth: number = currentConfig.depth,
  onInfo?: (info: EngineInfo) => void
): Promise<{ bestMove: string; ponder?: string }> {
  return new Promise((resolve, reject) => {
    if (!worker || !isReady) {
      reject(new Error('Stockfish not initialized'));
      return;
    }

    const timeout = setTimeout(() => {
      reject(new Error('Analysis timeout'));
    }, 60000); // 60 second timeout

    analyzePosition(fen, depth, onInfo, (bestMove, ponder) => {
      clearTimeout(timeout);
      resolve({ bestMove, ponder });
    });
  });
}
