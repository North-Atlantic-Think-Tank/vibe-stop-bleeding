import { useEffect, useRef, useState } from 'react';
import { base } from '../config';
import {
  economyWidgets,
  type EconomyStatWidget,
} from '../data/canadaEconomyStats';
import StatWidget from './widgets/StatWidget';
import WidgetTooltip from './widgets/WidgetTooltip';
import WidgetModal from './widgets/WidgetModal';

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
          animatedValue:
            widget.animatedValue + Math.ceil(widget.perSecondIncrease),
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
      {/* Background video section */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0"
      >
        <source src={`${base}/videos/maple_in_snow_s.mp4`} type="video/mp4" />
      </video>

      {/* Overlay to darken video for better text readability */}
      {/* NO NEED TO HAVE THIS, THE VIDEO IS VAGUE ENOUGH */}
      {/* <div className="absolute inset-0 bg-black/20 z-[1]"></div> */}

      {/* Widget Grid */}
      <div className="relative z-20 container mx-auto px-4 sm:px-6 md:px-8 py-6 md:py-10">
        <div
          className="grid gap-4 sm:gap-6 md:gap-8 lg:gap-10"
          style={{
            gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))`,
          }}
        >
          {widgetData.map((widget) => (
            <StatWidget
              key={widget.id}
              widget={widget}
              onMouseEnter={() => setHoveredWidget(widget)}
              onMouseLeave={() => setHoveredWidget(null)}
              onClick={() => setSelectedWidget(widget)}
            />
          ))}
        </div>
      </div>

      {/* Hover Tooltip - Hidden on mobile/tablets */}
      {!selectedWidget && (
        <WidgetTooltip widget={hoveredWidget} isMobile={isMobile} />
      )}

      {/* Expanded Widget Modal */}
      <WidgetModal
        widget={selectedWidget}
        onClose={() => setSelectedWidget(null)}
      />

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
