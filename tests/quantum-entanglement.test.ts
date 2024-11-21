import { describe, it, beforeEach, expect, vi } from 'vitest';

// Simulated contract state
let entangledPairs: Map<number, { creator: string, particle1: number | null, particle2: number | null, measured: boolean }>;
let userPairs: Map<string, number[]>;
let nextPairId: number;

// Simulated contract functions
function createEntangledPair(creator: string): number {
  const pairId = nextPairId++;
  entangledPairs.set(pairId, { creator, particle1: null, particle2: null, measured: false });
  const userPairList = userPairs.get(creator) || [];
  userPairs.set(creator, [...userPairList, pairId]);
  return pairId;
}

function measureParticle(pairId: number): number {
  const pair = entangledPairs.get(pairId);
  if (!pair) throw new Error("ERR-PAIR-NOT-FOUND");
  if (pair.measured) throw new Error("ERR-ALREADY-MEASURED");
  
  const measurement = Math.random() < 0.5 ? 0 : 1;
  pair.particle1 = measurement;
  pair.particle2 = 1 - measurement;
  pair.measured = true;
  entangledPairs.set(pairId, pair);
  return measurement;
}

function getEntangledPair(pairId: number) {
  const pair = entangledPairs.get(pairId);
  if (!pair) throw new Error("ERR-PAIR-NOT-FOUND");
  return pair;
}

function getUserPairs(user: string): number[] {
  return userPairs.get(user) || [];
}

function verifyEntanglement(pairId: number): boolean {
  const pair = entangledPairs.get(pairId);
  if (!pair) throw new Error("ERR-PAIR-NOT-FOUND");
  if (pair.particle1 === null || pair.particle2 === null) return false;
  return pair.particle1 !== pair.particle2;
}

describe('Quantum Entanglement Contract', () => {
  beforeEach(() => {
    entangledPairs = new Map();
    userPairs = new Map();
    nextPairId = 0;
  });
  
  it('should create an entangled pair', () => {
    const pairId = createEntangledPair('user1');
    expect(pairId).toBe(0);
    expect(entangledPairs.size).toBe(1);
    expect(userPairs.get('user1')).toContain(0);
  });
  
  it('should measure a particle', () => {
    const pairId = createEntangledPair('user1');
    const measurement = measureParticle(pairId);
    expect(measurement).toBeGreaterThanOrEqual(0);
    expect(measurement).toBeLessThanOrEqual(1);
    const pair = entangledPairs.get(pairId)!;
    expect(pair.measured).toBe(true);
    expect(pair.particle1).not.toBeNull();
    expect(pair.particle2).not.toBeNull();
  });
  
  it('should not allow measuring an already measured pair', () => {
    const pairId = createEntangledPair('user1');
    measureParticle(pairId);
    expect(() => measureParticle(pairId)).toThrow("ERR-ALREADY-MEASURED");
  });
  
  it('should get the state of an entangled pair', () => {
    const pairId = createEntangledPair('user1');
    measureParticle(pairId);
    const pair = getEntangledPair(pairId);
    expect(pair).toHaveProperty('creator', 'user1');
    expect(pair).toHaveProperty('particle1');
    expect(pair).toHaveProperty('particle2');
    expect(pair).toHaveProperty('measured', true);
  });
  
  it('should verify entanglement', () => {
    const pairId = createEntangledPair('user1');
    measureParticle(pairId);
    const isEntangled = verifyEntanglement(pairId);
    expect(isEntangled).toBe(true);
  });
  
  it('should return false for unmeasured pairs', () => {
    const pairId = createEntangledPair('user1');
    const isEntangled = verifyEntanglement(pairId);
    expect(isEntangled).toBe(false);
  });
  
  it('should return user pairs', () => {
    createEntangledPair('user1');
    createEntangledPair('user1');
    const userPairIds = getUserPairs('user1');
    expect(userPairIds).toHaveLength(2);
    expect(userPairIds).toContain(0);
    expect(userPairIds).toContain(1);
  });
});

