import {
  formatValue,
  calculateChangePercent,
  getChangeColor,
  type EconomyStatWidget,
} from '../../data/canadaEconomyStats';

interface WidgetData extends EconomyStatWidget {
  animatedValue: number;
}

interface StatWidgetProps {
  widget: WidgetData;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onClick: () => void;
}

export default function StatWidget({
  widget,
  onMouseEnter,
  onMouseLeave,
  onClick,
}: StatWidgetProps) {
  const change2024 = calculateChangePercent(
    widget.year2024Value,
    widget.year2023Value,
  );
  const color2024 = getChangeColor(change2024, widget.isNegativeGood);

  return (
    <div
      className="bg-white/95 backdrop-blur-md rounded-lg p-3 sm:p-4 border-2 border-gray-200 hover:border-canadian-red hover:shadow-xl transition-all duration-300 cursor-pointer active:scale-95 md:hover:scale-105"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
    >
      {/* Title */}
      <h3 className="text-xs sm:text-xs font-bold text-gray-700 mb-1.5 sm:mb-2 uppercase tracking-wide line-clamp-2">
        {widget.title}
      </h3>

      {/* Animated Current Value */}
      <div className="mb-1.5 sm:mb-2">
        <div className="text-xl sm:text-2xl md:text-3xl font-bold text-canadian-red leading-tight">
          {formatValue(widget.animatedValue, widget)}
        </div>
        <div className="text-xs text-gray-500 mt-0.5 sm:mt-1">
          +{widget.perSecondIncrease}/sec
        </div>
      </div>

      {/* Comparisons */}
      <div className="space-y-0.5 sm:space-y-1 text-xs">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">2024:</span>
          <span className="font-semibold text-gray-800">
            {formatValue(widget.year2024Value, widget)}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600">vs 2023:</span>
          <span className="font-bold" style={{ color: color2024 }}>
            {change2024 > 0 ? '+' : ''}
            {change2024.toFixed(1)}%
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600">2023:</span>
          <span className="font-semibold text-gray-800">
            {formatValue(widget.year2023Value, widget)}
          </span>
        </div>
      </div>
    </div>
  );
}
