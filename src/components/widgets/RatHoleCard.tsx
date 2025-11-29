import { formatCurrency, type RatHole } from '../../data/ratHoles';
import { useState } from 'react';

interface RatHoleCardProps {
  ratHole: RatHole;
  onClick?: () => void;
}

const categoryColors = {
  ngo: {
    bg: 'bg-blue-50',
    border: 'border-blue-300',
    hover: 'hover:border-blue-500',
    text: 'text-blue-700',
    badge: 'bg-blue-100 text-blue-800',
  },
  lgbt: {
    bg: 'bg-purple-50',
    border: 'border-purple-300',
    hover: 'hover:border-purple-500',
    text: 'text-purple-700',
    badge: 'bg-purple-100 text-purple-800',
  },
  'foreign-aid': {
    bg: 'bg-green-50',
    border: 'border-green-300',
    hover: 'hover:border-green-500',
    text: 'text-green-700',
    badge: 'bg-green-100 text-green-800',
  },
  corporate: {
    bg: 'bg-orange-50',
    border: 'border-orange-300',
    hover: 'hover:border-orange-500',
    text: 'text-orange-700',
    badge: 'bg-orange-100 text-orange-800',
  },
  other: {
    bg: 'bg-gray-50',
    border: 'border-gray-300',
    hover: 'hover:border-gray-500',
    text: 'text-gray-700',
    badge: 'bg-gray-100 text-gray-800',
  },
};

const categoryLabels = {
  ngo: 'NGO',
  lgbt: 'LGBT+',
  'foreign-aid': 'Foreign Aid',
  corporate: 'Corporate',
  other: 'Other',
};

const statusColors = {
  ongoing: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-green-100 text-green-800',
  'under-investigation': 'bg-red-100 text-red-800',
};

export default function RatHoleCard({ ratHole, onClick }: RatHoleCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const colors = categoryColors[ratHole.category];

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      setIsExpanded(!isExpanded);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-CA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div
      className={`${colors.bg} ${colors.border} ${colors.hover} border-2 rounded-lg p-4 sm:p-6 transition-all duration-300 cursor-pointer hover:shadow-lg ${isExpanded ? 'shadow-xl' : ''}`}
      onClick={handleClick}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <div className="flex flex-wrap gap-2 mb-2">
            <span
              className={`${colors.badge} text-xs font-semibold px-2 py-1 rounded-full uppercase tracking-wide`}
            >
              {categoryLabels[ratHole.category]}
            </span>
            {ratHole.status && (
              <span
                className={`${statusColors[ratHole.status]} text-xs font-semibold px-2 py-1 rounded-full uppercase tracking-wide`}
              >
                {ratHole.status.replace('-', ' ')}
              </span>
            )}
          </div>
          <h3
            className={`text-lg sm:text-xl font-bold ${colors.text} mb-2 leading-tight`}
          >
            {ratHole.title}
          </h3>
        </div>
      </div>

      {/* Amount - Most Prominent */}
      <div className="mb-4">
        <div className="text-3xl sm:text-4xl font-black text-canadian-red">
          {formatCurrency(ratHole.amount)}
        </div>
        <div className="text-xs text-gray-500 mt-1">{formatDate(ratHole.date)}</div>
      </div>

      {/* Entity */}
      <div className="mb-3">
        <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">
          Recipient
        </div>
        <div className="text-sm font-bold text-gray-800">{ratHole.entity}</div>
      </div>

      {/* Abstract */}
      <div className="mb-4">
        <p className="text-sm text-gray-700 leading-relaxed line-clamp-3">
          {ratHole.abstract}
        </p>
      </div>

      {/* Stakeholders Preview */}
      {ratHole.stakeholders.length > 0 && (
        <div className="mb-3">
          <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">
            Key Stakeholders
          </div>
          <div className="flex flex-wrap gap-2">
            {ratHole.stakeholders.slice(0, 2).map((stakeholder, idx) => (
              <div
                key={idx}
                className="text-xs bg-white px-2 py-1 rounded border border-gray-200"
              >
                <span className="font-semibold">{stakeholder.name}</span>
                {stakeholder.role && (
                  <span className="text-gray-500"> - {stakeholder.role}</span>
                )}
              </div>
            ))}
            {ratHole.stakeholders.length > 2 && (
              <div className="text-xs bg-white px-2 py-1 rounded border border-gray-200 text-gray-500">
                +{ratHole.stakeholders.length - 2} more
              </div>
            )}
          </div>
        </div>
      )}

      {/* Expanded Details */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t-2 border-gray-300 space-y-3 animate-slideDown">
          {/* All Stakeholders */}
          {ratHole.stakeholders.length > 2 && (
            <div>
              <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                All Stakeholders
              </div>
              <div className="space-y-2">
                {ratHole.stakeholders.map((stakeholder, idx) => (
                  <div key={idx} className="text-sm">
                    {stakeholder.link ? (
                      <a
                        href={stakeholder.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-canadian-red hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {stakeholder.name}
                      </a>
                    ) : (
                      <span className="font-semibold">{stakeholder.name}</span>
                    )}
                    {stakeholder.role && (
                      <span className="text-gray-600"> - {stakeholder.role}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sources */}
          {ratHole.sources.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                Sources
              </div>
              <div className="space-y-2">
                {ratHole.sources.map((source, idx) => (
                  <div key={idx} className="text-sm">
                    <a
                      href={source.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-canadian-red hover:underline font-medium"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {source.title}
                    </a>
                    {source.publisher && (
                      <span className="text-gray-500 text-xs ml-2">
                        - {source.publisher}
                      </span>
                    )}
                    {source.date && (
                      <span className="text-gray-400 text-xs ml-2">
                        ({new Date(source.date).toLocaleDateString('en-CA')})
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {ratHole.tags && ratHole.tags.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                Tags
              </div>
              <div className="flex flex-wrap gap-2">
                {ratHole.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Expand/Collapse Indicator */}
      <div className="mt-4 text-center">
        <button
          className="text-xs text-gray-500 hover:text-gray-700 font-semibold uppercase tracking-wide"
          onClick={(e) => {
            e.stopPropagation();
            handleClick();
          }}
        >
          {isExpanded ? '▲ Show Less' : '▼ Show More'}
        </button>
      </div>

      {/* Animation styles */}
      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            max-height: 0;
          }
          to {
            opacity: 1;
            max-height: 1000px;
          }
        }
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
