import crypto from 'crypto';

export function getRandomUniqueID(): string {
  return Buffer.from(crypto.randomUUID().replace(/-/g, ''), 'hex').toString('base64url');
}

export function jsonValue(value: unknown): string | null {
  return value === undefined ? null : JSON.stringify(value);
}

export function eloAlgo(winnerElo: number, loserElo: number): [number, number] {
  const K = 32;
  const winnerExpected = 1 / (1 + Math.pow(10, (loserElo - winnerElo) / 400));
  const loserExpected = 1 - winnerExpected;
  const winnerChange = winnerElo + K * (1 - winnerExpected);
  const loserChange = loserElo + K * (0 - loserExpected);
  return [Math.round(winnerChange - winnerElo), Math.round(loserChange - loserElo)];
}
