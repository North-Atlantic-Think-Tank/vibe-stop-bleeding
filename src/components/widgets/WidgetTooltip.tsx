import type { EconomyStatWidget } from '../../data/canadaEconomyStats';

interface WidgetData extends EconomyStatWidget {
  animatedValue: number;
}

interface WidgetTooltipProps {
  widget: WidgetData | null;
  isMobile: boolean;
}

export default function WidgetTooltip({
  widget,
  isMobile,
}: WidgetTooltipProps) {
  if (!widget || isMobile) {
    return null;
  }

  return (
    <div
      className="hidden lg:block fixed bg-white/95 backdrop-blur-sm rounded-lg shadow-xl p-6 max-w-md border border-gray-200 z-20 animate-fadeIn"
      style={{
        top: '20px',
        right: '20px',
      }}
    >
      <h3 className="font-bold text-lg mb-3 text-gray-900">{widget.title}</h3>
      <div className="space-y-2">
        {widget.keyInsights.slice(0, 3).map((insight, idx) => (
          <div key={idx} className="text-sm text-gray-700 flex items-start">
            <span className="text-canadian-red mr-2 font-bold">•</span>
            <span>{insight}</span>
          </div>
        ))}
      </div>
      <div className="mt-3 text-xs text-gray-500 italic">
        Click for full details
      </div>
    </div>
  );
}
