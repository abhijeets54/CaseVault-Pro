'use client';

import { COCEvent } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import { Shield, Upload, FileSearch, Eye, FileText, Tag, Edit, Trash } from 'lucide-react';

interface ChainTimelineProps {
  events: COCEvent[];
}

export function ChainTimeline({ events }: ChainTimelineProps) {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'uploaded':
        return <Upload size={16} />;
      case 'analyzed':
        return <FileSearch size={16} />;
      case 'viewed':
        return <Eye size={16} />;
      case 'exported':
        return <FileText size={16} />;
      case 'tagged':
        return <Tag size={16} />;
      case 'modified':
        return <Edit size={16} />;
      case 'deleted':
        return <Trash size={16} />;
      default:
        return <Shield size={16} />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'uploaded':
        return 'bg-brand-success';
      case 'analyzed':
        return 'bg-brand-info';
      case 'viewed':
        return 'bg-brand-secondary';
      case 'exported':
        return 'bg-brand-accent';
      case 'tagged':
        return 'bg-brand-secondary';
      case 'modified':
        return 'bg-brand-warning';
      case 'deleted':
        return 'bg-brand-danger';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="relative">
      {events.map((event, index) => (
        <div key={event.id} className="flex gap-4 pb-8 relative">
          {/* Timeline Line */}
          {index < events.length - 1 && (
            <div className="absolute left-5 top-10 bottom-0 w-0.5 bg-brand-darkBorder"></div>
          )}

          {/* Icon */}
          <div
            className={`flex-shrink-0 w-10 h-10 rounded-full ${getActivityColor(
              event.activityType
            )} flex items-center justify-center text-white z-10`}
          >
            {getActivityIcon(event.activityType)}
          </div>

          {/* Content */}
          <div className="flex-1 bg-brand-darkCard border border-brand-darkBorder rounded-lg p-4">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h4 className="font-semibold text-white capitalize">
                  {event.activityType}
                </h4>
                <p className="text-sm text-gray-400">{formatDate(event.timestamp)}</p>
              </div>
              <span className="text-xs text-gray-500 font-mono">
                #{index + 1}
              </span>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex gap-2">
                <span className="text-gray-400">User:</span>
                <span className="text-white">{event.userFullName}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-gray-400">Email:</span>
                <span className="text-white">{event.userEmail}</span>
              </div>
              {event.ipAddress && (
                <div className="flex gap-2">
                  <span className="text-gray-400">IP:</span>
                  <span className="text-white font-mono">{event.ipAddress}</span>
                </div>
              )}
              <div className="flex gap-2">
                <span className="text-gray-400">Signature:</span>
                <span className="text-white font-mono text-xs truncate">
                  {event.digitalSignature.substring(0, 32)}...
                </span>
              </div>
              {Object.keys(event.metadata).length > 0 && (
                <details className="mt-2">
                  <summary className="text-gray-400 cursor-pointer hover:text-white">
                    Metadata
                  </summary>
                  <pre className="mt-2 p-2 bg-brand-darkBg rounded text-xs overflow-auto">
                    {JSON.stringify(event.metadata, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
