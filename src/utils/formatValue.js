export const TRACKER_TYPE = {
  NUMBER: 'number',
  MONETARY: 'monetary',
  PERCENTAGE: 'percentage',
};

export function formatValue(value, type) {
  const abs = Math.abs(value);
  const neg = value < 0;
  switch (type) {
    case TRACKER_TYPE.MONETARY:
      return (neg ? '−' : '') + '$' + abs.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    case TRACKER_TYPE.PERCENTAGE:
      return (neg ? '−' : '') + abs.toLocaleString('en-US', { maximumFractionDigits: 2 }) + '%';
    default: // TRACKER_TYPE.NUMBER
      return (neg ? '−' : '') + abs.toLocaleString('en-US', { maximumFractionDigits: 2 });
  }
}

export function formatActionAmount(amount, type) {
  const abs = Math.abs(amount);
  const sign = amount >= 0 ? '+' : '−';
  switch (type) {
    case TRACKER_TYPE.MONETARY: return sign + '$' + abs.toFixed(2);
    case TRACKER_TYPE.PERCENTAGE: return sign + abs.toFixed(2) + '%';
    default: return sign + abs.toFixed(2);
  }
}

export function formatHistoryAmount(amount, type) {
  const abs = Math.abs(amount);
  const sign = amount >= 0 ? '+' : '−';
  switch (type) {
    case TRACKER_TYPE.MONETARY:
      return sign + '$' + abs.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    case TRACKER_TYPE.PERCENTAGE:
      return sign + abs.toLocaleString('en-US', { maximumFractionDigits: 2 }) + '%';
    default:
      return sign + abs.toLocaleString('en-US', { maximumFractionDigits: 2 });
  }
}
