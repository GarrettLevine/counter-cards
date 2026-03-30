export function formatValue(value, type) {
  const abs = Math.abs(value);
  const neg = value < 0;
  switch (type) {
    case 'monetary':
      return (neg ? '−' : '') + '$' + abs.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    case 'percentage':
      return (neg ? '−' : '') + abs.toLocaleString('en-US', { maximumFractionDigits: 2 }) + '%';
    default: // 'number'
      return (neg ? '−' : '') + abs.toLocaleString('en-US', { maximumFractionDigits: 2 });
  }
}

export function formatActionAmount(amount, type) {
  const abs = Math.abs(amount);
  const sign = amount >= 0 ? '+' : '−';
  switch (type) {
    case 'monetary': return sign + '$' + abs.toFixed(2);
    case 'percentage': return sign + abs.toFixed(2) + '%';
    default: return sign + abs.toFixed(2);
  }
}

export function formatHistoryAmount(amount, type) {
  const abs = Math.abs(amount);
  const sign = amount >= 0 ? '+' : '−';
  switch (type) {
    case 'monetary':
      return sign + '$' + abs.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    case 'percentage':
      return sign + abs.toLocaleString('en-US', { maximumFractionDigits: 2 }) + '%';
    default:
      return sign + abs.toLocaleString('en-US', { maximumFractionDigits: 2 });
  }
}
