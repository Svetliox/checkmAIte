/**
 * Stockfish WASM Service
 * 
 * This service wraps the Stockfish chess engine using Web Workers
 * for browser-based chess analysis.
 */

import type { EngineConfig, EngineInfo, MultiPvLine } from '@/types';

// Engine state
let worker: Worker | null = null;
let isReady = false;
let messageCallback: ((info: EngineInfo) => void) | null = null;
let bestMoveCallback: ((move: string, ponder?: string) => void) | null = null;
const multiPvLines: Map<number, MultiPvLine> = new Map();

// Default configuration
const DEFAULT_CONFIG: EngineConfig = {
  depth: 20,
  multiPv: 3,
  threads: 1,
  hashSize: 16,
};

let currentConfig: EngineConfig = { ...DEFAULT_CONFIG };

/**
 * Parse UCI info line from Stockfish
 */
function parseInfoLine(line: string): EngineInfo | null {
  if (!line.startsWith('info ')) return null;

  const info: EngineInfo = {
    depth: 0,
    score: 0,
    pv: [],
  };

  // Parse depth
  const depthMatch = line.match(/\bdepth (\d+)/);
  if (depthMatch) info.depth = parseInt(depthMatch[1], 10);

  // Parse seldepth
  const seldepthMatch = line.match(/\bseldepth (\d+)/);
  if (seldepthMatch) info.seldepth = parseInt(seldepthMatch[1], 10);

  // Parse score (either cp or mate)
  const cpMatch = line.match(/\bscore cp (-?\d+)/);
  if (cpMatch) {
    info.score = parseInt(cpMatch[1], 10);
  }
  const mateMatch = line.match(/\bscore mate (-?\d+)/);
  if (mateMatch) {
    info.mate = parseInt(mateMatch[1], 10);
    // Convert mate score to centipawn equivalent for display
    info.score = info.mate > 0 ? 10000 - (info.mate * 10) : -10000 + (info.mate * -10);
  }

  // Parse nodes
  const nodesMatch = line.match(/\bnodes (\d+)/);
  if (nodesMatch) info.nodes = parseInt(nodesMatch[1], 10);

  // Parse nps
  const npsMatch = line.match(/\bnps (\d+)/);
  if (npsMatch) info.nps = parseInt(npsMatch[1], 10);

  // Parse time
  const timeMatch = line.match(/\btime (\d+)/);
  if (timeMatch) info.time = parseInt(timeMatch[1], 10);

  // Parse multipv
  const multipvMatch = line.match(/\bmultipv (\d+)/);
  if (multipvMatch) info.multipv = parseInt(multipvMatch[1], 10);

  // Parse PV line
  const pvMatch = line.match(/\bpv (.+)$/);
  if (pvMatch) {
    info.pv = pvMatch[1].split(' ').filter(m => m.length >= 4);
  }

  // Only return if we have meaningful data
  if (info.depth > 0 || info.pv.length > 0) {
    return info;
  }

  return null;
}

/**
 * Parse bestmove line from Stockfish
 */
function parseBestMoveLine(line: string): { bestMove: string; ponder?: string } | null {
  if (!line.startsWith('bestmove ')) return null;

  const parts = line.split(' ');
  const bestMove = parts[1];
  const ponderIndex = parts.indexOf('ponder');
  const ponder = ponderIndex > 0 ? parts[ponderIndex + 1] : undefined;

  return { bestMove, ponder };
}

/**
 * Handle messages from the Stockfish worker
 */
function handleMessage(event: MessageEvent): void {
  const line = typeof event.data === 'string' ? event.data : event.data?.toString();
  
  if (!line) return;

  // Handle readyok
  if (line === 'readyok') {
    isReady = true;
    return;
  }

  // Handle uciok (engine initialized)
  if (line === 'uciok') {
    return;
  }

  // Handle info lines
  const info = parseInfoLine(line);
  if (info && messageCallback) {
    // Store multi-PV line
    const pvRank = info.multipv || 1;
    if (info.pv.length > 0) {
      multiPvLines.set(pvRank, {
        rank: pvRank,
        moves: info.pv,
        sanMoves: [], // Will be filled by the caller
        score: info.score,
        mate: info.mate,
        depth: info.depth,
      });
    }
    messageCallback(info);
  }

  // Handle bestmove
  const bestMove = parseBestMoveLine(line);
  if (bestMove && bestMoveCallback) {
    bestMoveCallback(bestMove.bestMove, bestMove.ponder);
  }
}

/**
 * Initialize the Stockfish engine
 */
export async function initStockfish(config?: Partial<EngineConfig>): Promise<void> {
  if (worker) {
    console.log('[Stockfish] Already initialized');
    return;
  }

  if (config) {
    currentConfig = { ...currentConfig, ...config };
  }

  return new Promise((resolve, reject) => {
    try {
      // Load stockfish-18-single.js directly as a worker
      // This file is self-initializing and handles onmessage/postMessage
      worker = new Worker('/stockfish/stockfish-18-single.js');
      
      // Message handler during initialization
      const initHandler = (event: MessageEvent) => {
        const line = typeof event.data === 'string' ? event.data : event.data?.toString();
        
        if (!line) return;
        
        // Handle normal UCI messages
        handleMessage(event);
      };
      
      worker.onmessage = initHandler;
      worker.onerror = (e) => {
        console.error('[Stockfish] Worker error:', e);
        reject(new Error('Failed to load Stockfish worker: ' + (e.message || 'Unknown error')));
      };

      // Send UCI init command - the worker will respond with "uciok"
      // Give the worker a moment to initialize before sending commands
      setTimeout(() => {
        worker?.postMessage('uci');
      }, 100);

      // Set a timeout for initialization
      const timeout = setTimeout(() => {
        reject(new Error('Stockfish initialization timeout'));
      }, 30000);

      // Poll for ready state
      const readyCheck = setInterval(() => {
        // Send isready command
        if (!isReady) {
          worker?.postMessage('isready');
        }
        
        if (isReady) {
          clearInterval(readyCheck);
          clearTimeout(timeout);
          
          // Switch to normal message handler
          if (worker) {
            worker.onmessage = handleMessage;
          }
          
          // Configure engine options
          worker?.postMessage(`setoption name MultiPV value ${currentConfig.multiPv}`);
          worker?.postMessage(`setoption name Hash value ${currentConfig.hashSize}`);
          
          console.log('[Stockfish] Engine ready');
          resolve();
        }
      }, 200);
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Analyze a position
 */
export function analyzePosition(
  fen: string,
  depth: number = currentConfig.depth,
  onInfo?: (info: EngineInfo) => void,
  onBestMove?: (move: string, ponder?: string) => void
): void {
  if (!worker || !isReady) {
    throw new Error('Stockfish not initialized');
  }

  // Clear previous analysis
  multiPvLines.clear();
  
  // Set callbacks
  messageCallback = onInfo || null;
  bestMoveCallback = onBestMove || null;

  // Set position and start analysis
  worker.postMessage(`position fen ${fen}`);
  worker.postMessage(`go depth ${depth}`);
}

/**
 * Stop current analysis
 */
export function stopAnalysis(): void {
  if (worker) {
    worker.postMessage('stop');
    messageCallback = null;
    bestMoveCallback = null;
    // Don't clear multiPvLines here - keep showing previous results
  }
}

/**
 * Get the multi-PV lines from the last analysis
 */
export function getMultiPvLines(): MultiPvLine[] {
  return Array.from(multiPvLines.values()).sort((a, b) => a.rank - b.rank);
}

/**
 * Check if engine is ready
 */
export function isEngineReady(): boolean {
  return isReady && worker !== null;
}

/**
 * Terminate the engine
 */
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

/**
 * Update engine configuration
 */
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

/**
 * Get current configuration
 */
export function getStockfishConfig(): EngineConfig {
  return { ...currentConfig };
}

/**
 * Analyze position and return a promise with the best move
 */
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
