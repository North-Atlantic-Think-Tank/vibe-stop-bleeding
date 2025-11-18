import { useEffect, useRef, useState } from 'react';
import { base } from '../config';
import {
  economyWidgets,
  formatValue,
  calculateChangePercent,
  getChangeColor,
  type EconomyStatWidget,
} from '../data/canadaEconomyStats';
import RainEffectAdvanced from './RainEffectAdvanced';

interface WidgetData extends EconomyStatWidget {
  animatedValue: number;
}

export default function CanadaStatistics() {
  const [widgetData, setWidgetData] = useState<WidgetData[]>(
    economyWidgets.map((widget) => ({
      ...widget,
      animatedValue: widget.currentValue,
    })),
  );
  const [selectedWidget, setSelectedWidget] = useState<WidgetData | null>(null);
  const [hoveredWidget, setHoveredWidget] = useState<WidgetData | null>(null);
  const intervalRef = useRef<number | null>(null);

  // Animation effect to update values per second
  useEffect(() => {
    intervalRef.current = window.setInterval(() => {
      setWidgetData((prevData) =>
        prevData.map((widget) => ({
          ...widget,
          animatedValue: widget.animatedValue + widget.perSecondIncrease,
        })),
      );
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Calculate grid columns based on screen size
  const getGridCols = () => {
    if (typeof window === 'undefined') return 1; // Default to 1 column for SSR
    const width = window.innerWidth;
    if (width < 640) return 1;
    if (width < 1024) return 2;
    if (width < 1280) return 3;
    return 4;
  };

  const [gridCols, setGridCols] = useState(1); // Start with 1 column to match SSR
  const [containerDimensions, setContainerDimensions] = useState({
    width: 0,
    height: 0,
  });
  const [isMobile, setIsMobile] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleResize = () => {
      setGridCols(getGridCols());

      // Check if mobile device (disable rain effect on mobile for performance)
      const screenWidth = window.innerWidth;
      setIsMobile(screenWidth < 768); // Disable on tablets and phones

      // Update container dimensions for RainEffect
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();

        // Only update if dimensions actually changed (avoid infinite loop)
        setContainerDimensions((prev) => {
          if (
            Math.abs(prev.width - width) > 1 ||
            Math.abs(prev.height - height) > 1
          ) {
            return { width, height };
          }
          return prev;
        });
      }
    };

    // Initial size calculation - delay to ensure DOM is ready
    setTimeout(handleResize, 100);

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div
      ref={containerRef}
      className="statis-map relative w-full bg-slate-50 overflow-hidden min-h-screen"
    >
      {/* Canada Map Background with Rain Effect - Disabled on mobile for performance */}
      {!isMobile &&
        containerDimensions.width > 0 &&
        containerDimensions.height > 0 && (
          <div
            className="absolute inset-0 z-0 opacity-30"
            style={{ pointerEvents: 'none' }}
          >
            <RainEffectAdvanced
              key="rain-effect-static" // Keep same key to prevent remounting
              backgroundImage={`${base}/images/maple_in_winter_sml.jpg`}
              width={containerDimensions.width}
              height={containerDimensions.height}
              rainIntensity={15}
              windStrength={0}
              glassDistortion={20}
            />
          </div>
        )}

      {/* Widget Grid */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 md:px-8 py-6 md:py-10">
        <div
          className="grid gap-4 sm:gap-6 md:gap-8 lg:gap-10"
          style={{
            gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))`,
          }}
        >
          {widgetData.map((widget) => {
            const change2024 = calculateChangePercent(
              widget.year2024Value,
              widget.year2023Value,
            );
            const color2024 = getChangeColor(change2024, widget.isNegativeGood);

            return (
              <div
                key={widget.id}
                className="bg-white backdrop-blur-sm rounded-lg p-3 sm:p-4 border-2 border-gray-200 hover:border-canadian-red hover:shadow-xl transition-all duration-300 cursor-pointer active:scale-95 md:hover:scale-105"
                onMouseEnter={(e) => {
                  setHoveredWidget(widget);
                }}
                onMouseLeave={() => setHoveredWidget(null)}
                onClick={() => setSelectedWidget(widget)}
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
                    +{formatValue(widget.perSecondIncrease, widget)}/sec
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
          })}
        </div>
      </div>

      {/* Hover Tooltip - Hidden on mobile/tablets */}
      {hoveredWidget && !selectedWidget && !isMobile && (
        <div
          className="hidden lg:block fixed bg-white/95 backdrop-blur-sm rounded-lg shadow-xl p-6 max-w-md border border-gray-200 z-20 animate-fadeIn"
          style={{
            top: '20px',
            right: '20px',
          }}
        >
          <h3 className="font-bold text-lg mb-3 text-gray-900">
            {hoveredWidget.title}
          </h3>
          <div className="space-y-2">
            {hoveredWidget.keyInsights.slice(0, 3).map((insight, idx) => (
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
      )}

      {/* Expanded Widget Modal */}
      {selectedWidget && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-30 p-2 sm:p-4 animate-fadeIn overflow-y-auto"
          onClick={() => setSelectedWidget(null)}
        >
          <div
            className="bg-white rounded-xl sm:rounded-2xl shadow-2xl max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto animate-slideUp my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 sm:p-6 md:p-8">
              {/* Header */}
              <div className="flex items-start justify-between mb-4 sm:mb-6 pb-3 sm:pb-4 border-b-2 border-gray-200">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 pr-2">
                  {selectedWidget.title}
                </h2>
                <button
                  onClick={() => setSelectedWidget(null)}
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
                    {formatValue(selectedWidget.animatedValue, selectedWidget)}
                  </div>
                  <div className="text-xs sm:text-sm opacity-80">
                    Increasing +
                    {formatValue(
                      selectedWidget.perSecondIncrease,
                      selectedWidget,
                    )}
                    /second
                  </div>
                </div>

                <div className="bg-slate-50 rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-md">
                  <div className="text-xs sm:text-sm text-gray-600 mb-1.5 sm:mb-2 font-semibold">
                    2024 Official Value
                  </div>
                  <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-1.5 sm:mb-2">
                    {formatValue(selectedWidget.year2024Value, selectedWidget)}
                  </div>
                  <div
                    className="text-xs sm:text-sm font-bold"
                    style={{
                      color: getChangeColor(
                        calculateChangePercent(
                          selectedWidget.year2024Value,
                          selectedWidget.year2023Value,
                        ),
                        selectedWidget.isNegativeGood,
                      ),
                    }}
                  >
                    {calculateChangePercent(
                      selectedWidget.year2024Value,
                      selectedWidget.year2023Value,
                    ) > 0
                      ? '↑'
                      : '↓'}{' '}
                    {Math.abs(
                      calculateChangePercent(
                        selectedWidget.year2024Value,
                        selectedWidget.year2023Value,
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
                    {formatValue(selectedWidget.year2023Value, selectedWidget)}
                  </div>
                </div>

                <div className="bg-slate-50 rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-md">
                  <div className="text-xs sm:text-sm text-gray-600 mb-1.5 sm:mb-2 font-semibold">
                    Annual Change (2023-2024)
                  </div>
                  <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">
                    {formatValue(
                      Math.abs(
                        selectedWidget.year2024Value -
                          selectedWidget.year2023Value,
                      ),
                      selectedWidget,
                    )}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600 mt-1">
                    {selectedWidget.year2024Value > selectedWidget.year2023Value
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
                  {selectedWidget.keyInsights.map((insight, idx) => (
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
                  {selectedWidget.fullDescription}
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
      )}

      {/* Custom styles for animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.4s ease-out;
        }
      `}</style>
    </div>
  );
}
