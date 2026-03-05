export const SPRINGS = {
  bouncy: { type: 'spring' as const, stiffness: 400, damping: 15 },
  gentle: { type: 'spring' as const, stiffness: 200, damping: 20 },
  snappy: { type: 'spring' as const, stiffness: 500, damping: 25 },
  wobbly: { type: 'spring' as const, stiffness: 300, damping: 10 },
} as const;
