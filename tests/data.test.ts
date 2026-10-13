import { describe, expect, it } from 'vitest';
import { checkBudgets, checkIntegrity, checkReachability } from '../src/data/validate';

describe('content', () => {
  it('has valid references and roster counts', () => expect(checkIntegrity()).toEqual([]));
  it('keeps every card inside its stat budget', () => expect(checkBudgets()).toEqual([]));
  it('makes every card reachable in both modes', () => expect(checkReachability()).toEqual([]));
});
