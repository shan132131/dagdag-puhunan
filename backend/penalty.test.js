// Unit tests for penalty calculation logic
// These test the algorithm without hitting the database

const GRACE_DAYS   = 3;
const PENALTY_RATE = 0.001;  // 0.1% per day

const calculatePenalty = (balance, loaned, dueDate) => {
  const today     = new Date();
  const rawDays   = Math.max(0, Math.floor((today - new Date(dueDate)) / 86400000));
  const penaltyDays = Math.max(0, rawDays - GRACE_DAYS);
  const MAX_PENALTY = loaned * 0.20;
  const rawPenalty  = balance * PENALTY_RATE * penaltyDays;
  return {
    rawDays,
    penaltyDays,
    amount: parseFloat(Math.min(rawPenalty, MAX_PENALTY).toFixed(2)),
    capped: rawPenalty > MAX_PENALTY,
  };
};

describe('Penalty Calculator', () => {
  it('returns zero penalty within grace period', () => {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() - 2); // 2 days ago (within grace)
    const { amount } = calculatePenalty(10000, 10000, dueDate);
    expect(amount).toBe(0);
  });

  it('calculates correctly after grace period', () => {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() - 10); // 10 days ago
    const { amount, penaltyDays } = calculatePenalty(10000, 10000, dueDate);
    expect(penaltyDays).toBe(7); // 10 - 3 grace
    expect(amount).toBe(70); // 10000 * 0.001 * 7
  });

  it('caps penalty at 20% of principal', () => {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() - 300); // extreme overdue
    const { amount, capped } = calculatePenalty(10000, 10000, dueDate);
    expect(amount).toBe(2000); // max 20% of 10000
    expect(capped).toBe(true);
  });

  it('uses balance (not loaned) for daily calculation', () => {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() - 10);
    const { amount } = calculatePenalty(5000, 10000, dueDate); // half paid
    expect(amount).toBe(35); // 5000 * 0.001 * 7
  });

  it('returns 0 for future due date', () => {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 5); // future
    const { amount } = calculatePenalty(10000, 10000, dueDate);
    expect(amount).toBe(0);
  });
});
