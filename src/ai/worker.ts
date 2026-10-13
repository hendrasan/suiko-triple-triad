// Web worker: runs the search off the main thread so the UI never freezes.
import { chooseMove, type SearchOpts } from './search';
import type { GameState } from '../core/types';

self.onmessage = (e: MessageEvent<{ id: number; state: GameState; opts: SearchOpts }>) => {
  const { id, state, opts } = e.data;
  const move = chooseMove(state, opts);
  (self as unknown as Worker).postMessage({ id, move });
};
