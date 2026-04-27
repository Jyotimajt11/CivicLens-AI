// IssueCard — compact card displaying a single civic issue report

import { formatDistanceToNow } from '../utils/dateUtils';
import SeverityBadge from './SeverityBadge';
import CategoryBadge from './CategoryBadge';
import { MapPin } from 'lucide-react';

export default function IssueCard({ report, onClick }) {
  return (
    <div
      id={`issue-card-${report.id}`}
      className="issue-card"
      onClick={() => onClick?.(report)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick?.(report)}
    >
      {/* Image thumbnail */}
      {report.imageUrl && (
        <div className="w-full h-32 rounded-xl overflow-hidden mb-3">
          <img
            src={report.imageUrl}
            alt={`Issue: ${report.category}`}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      )}

      {/* Badges row */}
      <div className="flex flex-wrap gap-1.5 mb-2">
        <CategoryBadge category={report.category} />
        <SeverityBadge severity={report.severity} />
      </div>

      {/* Description */}
      <p className="text-dark-300 text-sm line-clamp-2 mb-2">
        {report.description || 'No description provided.'}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-dark-500">
        <span className="flex items-center gap-1">
          <MapPin size={11} />
          {report.latitude?.toFixed(4)}, {report.longitude?.toFixed(4)}
        </span>
        <span>{formatDistanceToNow(report.createdAt)}</span>
      </div>
    </div>
  );
}
