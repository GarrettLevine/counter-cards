export const PASTEL_COLORS = [
  { label: 'Red',    hex: '#FFD6D6' },
  { label: 'Orange', hex: '#FFE8CC' },
  { label: 'Yellow', hex: '#FFF5CC' },
  { label: 'Green',  hex: '#D6F0D6' },
  { label: 'Blue',   hex: '#CCE8FF' },
  { label: 'Indigo', hex: '#E8D6FF' },
  { label: 'Pink',   hex: '#FFD6F0' },
];

export function pastelForTracker(tracker) {
  return tracker.color ?? PASTEL_COLORS[tracker.id % PASTEL_COLORS.length].hex;
}
