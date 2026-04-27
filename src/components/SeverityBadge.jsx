// SeverityBadge — colored badge for low / medium / high severity

export default function SeverityBadge({ severity }) {
  const map = {
    high:   { cls: 'badge-high',   label: '🔴 High' },
    medium: { cls: 'badge-medium', label: '🟡 Medium' },
    low:    { cls: 'badge-low',    label: '🟢 Low' },
  };

  const { cls, label } = map[severity] || map.medium;

  return <span className={cls}>{label}</span>;
}
