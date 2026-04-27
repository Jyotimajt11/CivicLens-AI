// CategoryBadge — displays a civic issue category with an icon

const CATEGORY_MAP = {
  pothole:             { label: 'Pothole',           icon: '🕳️' },
  garbage:             { label: 'Garbage',           icon: '🗑️' },
  water_leak:          { label: 'Water Leak',        icon: '💧' },
  broken_streetlight:  { label: 'Streetlight',       icon: '💡' },
  graffiti:            { label: 'Graffiti',          icon: '🎨' },
  flooding:            { label: 'Flooding',          icon: '🌊' },
  road_damage:         { label: 'Road Damage',       icon: '🚧' },
  illegal_dumping:     { label: 'Illegal Dumping',   icon: '♻️' },
  sewage:              { label: 'Sewage',            icon: '🚽' },
  other:               { label: 'Other',             icon: '📌' },
};

export default function CategoryBadge({ category }) {
  const { label, icon } = CATEGORY_MAP[category] || CATEGORY_MAP.other;

  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-500/15 text-brand-300 ring-1 ring-brand-500/25">
      {icon} {label}
    </span>
  );
}

// Export the map so other components can use it
export { CATEGORY_MAP };
