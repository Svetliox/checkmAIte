import type {
  AnalysisResult,
  ChessMove,
  ChessPosition,
  EngineConfig,
  EngineStatus,
} from '@/types';

const DEFAULT_CONFIG: EngineConfig = {
  depth: 20,
  multiPv: 3,
  threads: 1,
  hashSize: 16,
};

let engineStatus: EngineStatus = 'idle';
let currentConfig: EngineConfig = { ...DEFAULT_CONFIG };

 
export async function initEngine(config?: Partial<EngineConfig>): Promise<void> {
  engineStatus = 'loading';
  
  if (config) {
    currentConfig = { ...currentConfig, ...config };
  }

  await new Promise((resolve) => setTimeout(resolve, 500));
  engineStatus = 'ready';
  console.log('[Engine] Stockfish engine initialized (stub)');
}

 
export function getEngineStatus(): EngineStatus {
  return engineStatus;
}

 
export async function analyzePosition(
  fen: ChessPosition,
  depth?: number
): Promise<AnalysisResult> {
  if (engineStatus !== 'ready') {
    throw new Error('Engine not ready. Call initEngine() first.');
  }

  engineStatus = 'analyzing';

  await new Promise((resolve) => setTimeout(resolve, 300));
  const result: AnalysisResult = {
    bestMove: {
      from: 'e2',
      to: 'e4',
      san: 'e4',
    },
    evaluation: 0.3,
    depth: depth || currentConfig.depth,
    pv: [
      { from: 'e2', to: 'e4', san: 'e4' },
      { from: 'e7', to: 'e5', san: 'e5' },
      { from: 'g1', to: 'f3', san: 'Nf3' },
    ],
    nodes: 1500000,
    time: 300,
  };
  engineStatus = 'ready';
  return result;
}

 
export async function getBestMove(
  fen: ChessPosition,
  depth?: number
): Promise<ChessMove | null> {
  const analysis = await analyzePosition(fen, depth);
  return analysis.bestMove;
}

 
export function stopAnalysis(): void {
  if (engineStatus === 'analyzing') {
    engineStatus = 'ready';
    console.log('[Engine] Analysis stopped');
  }
}

 
export function terminateEngine(): void {
  engineStatus = 'idle';
  console.log('[Engine] Engine terminated');
}

 
export function setEngineConfig(config: Partial<EngineConfig>): void {
  currentConfig = { ...currentConfig, ...config };
  console.log('[Engine] Config updated:', currentConfig);
}

 
export function getEngineConfig(): EngineConfig {
  return { ...currentConfig };
}
