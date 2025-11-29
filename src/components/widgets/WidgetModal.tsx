import {
  formatValue,
  calculateChangePercent,
  getChangeColor,
  type EconomyStatWidget,
} from '../../data/canadaEconomyStats';

interface WidgetData extends EconomyStatWidget {
  animatedValue: number;
}

interface WidgetModalProps {
  widget: WidgetData | null;
  onClose: () => void;
}

export default function WidgetModal({ widget, onClose }: WidgetModalProps) {
  if (!widget) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-30 p-2 sm:p-4 animate-fadeIn overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl sm:rounded-2xl shadow-2xl max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto animate-slideUp my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 sm:p-6 md:p-8">
          {/* Header */}
          <div className="flex items-start justify-between mb-4 sm:mb-6 pb-3 sm:pb-4 border-b-2 border-gray-200">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 pr-2">
              {widget.title}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1.5 sm:p-2 hover:bg-gray-100 rounded-full flex-shrink-0"
            >
              <svg
                className="w-5 h-5 sm:w-6 sm:h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div className="bg-gradient-to-br from-canadian-red to-red-700 text-white rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-lg">
              <div className="text-xs sm:text-sm font-semibold mb-1.5 sm:mb-2 opacity-90">
                Current Value (Live)
              </div>
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1.5 sm:mb-2">
                {formatValue(widget.animatedValue, widget)}
              </div>
              <div className="text-xs sm:text-sm opacity-80">
                Increasing +
                {formatValue(widget.perSecondIncrease, widget)}
                /second
              </div>
            </div>

            <div className="bg-slate-50 rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-md">
              <div className="text-xs sm:text-sm text-gray-600 mb-1.5 sm:mb-2 font-semibold">
                2024 Official Value
              </div>
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-1.5 sm:mb-2">
                {formatValue(widget.year2024Value, widget)}
              </div>
              <div
                className="text-xs sm:text-sm font-bold"
                style={{
                  color: getChangeColor(
                    calculateChangePercent(
                      widget.year2024Value,
                      widget.year2023Value,
                    ),
                    widget.isNegativeGood,
                  ),
                }}
              >
                {calculateChangePercent(
                  widget.year2024Value,
                  widget.year2023Value,
                ) > 0
                  ? '↑'
                  : '↓'}{' '}
                {Math.abs(
                  calculateChangePercent(
                    widget.year2024Value,
                    widget.year2023Value,
                  ),
                ).toFixed(1)}
                % from 2023
              </div>
            </div>

            <div className="bg-slate-50 rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-md">
              <div className="text-xs sm:text-sm text-gray-600 mb-1.5 sm:mb-2 font-semibold">
                2023 Value
              </div>
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">
                {formatValue(widget.year2023Value, widget)}
              </div>
            </div>

            <div className="bg-slate-50 rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-md">
              <div className="text-xs sm:text-sm text-gray-600 mb-1.5 sm:mb-2 font-semibold">
                Annual Change (2023-2024)
              </div>
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">
                {formatValue(
                  Math.abs(widget.year2024Value - widget.year2023Value),
                  widget,
                )}
              </div>
              <div className="text-xs sm:text-sm text-gray-600 mt-1">
                {widget.year2024Value > widget.year2023Value
                  ? 'Increase'
                  : 'Decrease'}
              </div>
            </div>
          </div>

          {/* Key Insights */}
          <div className="mb-6 sm:mb-8">
            <h3 className="font-bold text-lg sm:text-xl mb-3 sm:mb-4 text-gray-900 flex items-center">
              <span className="w-1 h-5 sm:h-6 bg-canadian-red mr-2 sm:mr-3 rounded"></span>
              Key Insights
            </h3>
            <ul className="space-y-2 sm:space-y-3 bg-slate-50 rounded-lg sm:rounded-xl p-4 sm:p-6">
              {widget.keyInsights.map((insight, idx) => (
                <li
                  key={idx}
                  className="text-sm sm:text-base text-gray-700 flex items-start leading-relaxed"
                >
                  <span className="text-canadian-red mr-2 sm:mr-3 mt-0.5 sm:mt-1 font-bold text-base sm:text-lg flex-shrink-0">
                    •
                  </span>
                  <span>{insight}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Full Description */}
          <div>
            <h3 className="font-bold text-lg sm:text-xl mb-3 sm:mb-4 text-gray-900 flex items-center">
              <span className="w-1 h-5 sm:h-6 bg-canadian-red mr-2 sm:mr-3 rounded"></span>
              Detailed Analysis
            </h3>
            <p className="text-sm sm:text-base text-gray-700 leading-relaxed bg-slate-50 rounded-lg sm:rounded-xl p-4 sm:p-6">
              {widget.fullDescription}
            </p>
          </div>

          {/* Source Footer */}
          <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200 text-center">
            <p className="text-xs sm:text-sm text-gray-500">
              Data compiled from Statistics Canada, TransUnion, Equifax, and
              Government of Canada sources
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Last updated: November 2025
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
