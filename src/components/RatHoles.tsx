import { useState, useMemo, useRef, useEffect } from 'react';
import {
  ratHoles,
  formatCurrency,
  getTotalSpending,
  getSpendingByCategory,
  sortRatHoles,
  filterByCategory,
  type RatHole,
} from '../data/ratHoles';
import RatHoleCard from './widgets/RatHoleCard';

type SortOption = 'amount' | 'date' | 'title';
type CategoryFilter = RatHole['category'] | 'all';

export default function RatHoles() {
  const [sortBy, setSortBy] = useState<SortOption>('amount');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate grid columns based on screen size
  const getGridCols = () => {
    if (typeof window === 'undefined') return 1;
    const width = window.innerWidth;
    if (width < 640) return 1;
    if (width < 1024) return 2;
    if (width < 1536) return 3;
    return 4;
  };

  const [gridCols, setGridCols] = useState(1);

  useEffect(() => {
    const handleResize = () => {
      setGridCols(getGridCols());
    };

    setTimeout(handleResize, 100);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Filter and sort data
  const filteredAndSortedHoles = useMemo(() => {
    let filtered =
      categoryFilter === 'all'
        ? ratHoles
        : filterByCategory(ratHoles, categoryFilter);

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (hole) =>
          hole.title.toLowerCase().includes(query) ||
          hole.abstract.toLowerCase().includes(query) ||
          hole.entity.toLowerCase().includes(query) ||
          hole.stakeholders.some((s) => s.name.toLowerCase().includes(query)),
      );
    }

    return sortRatHoles(filtered, sortBy);
  }, [sortBy, categoryFilter, searchQuery]);

  // Calculate statistics
  const totalSpending = getTotalSpending();
  const categoryStats = {
    ngo: getSpendingByCategory('ngo'),
    lgbt: getSpendingByCategory('lgbt'),
    'foreign-aid': getSpendingByCategory('foreign-aid'),
    corporate: getSpendingByCategory('corporate'),
    other: getSpendingByCategory('other'),
  };

  return (
    <div
      ref={containerRef}
      className="rat-holes-container relative w-full bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 min-h-screen"
    >
      {/* Header Section */}
      <div className="relative bg-canadian-red text-white py-12 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6 md:px-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black mb-4 tracking-tight">
              🕳️ Rat Holes
            </h1>
            <p className="text-lg sm:text-xl text-red-100 max-w-3xl mx-auto">
              Tracking questionable government spending: Where your tax dollars go
            </p>
          </div>

          {/* Total Spending Banner */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 max-w-4xl mx-auto border-2 border-white/20">
            <div className="text-center">
              <div className="text-sm uppercase tracking-wider text-red-100 mb-2">
                Total Documented Spending
              </div>
              <div className="text-5xl sm:text-6xl font-black">
                {formatCurrency(totalSpending)}
              </div>
              <div className="text-sm text-red-100 mt-2">
                CAD of taxpayer money
              </div>
            </div>

            {/* Category Breakdown */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mt-6">
              {Object.entries(categoryStats).map(([category, amount]) => (
                <div
                  key={category}
                  className="bg-white/10 rounded p-3 text-center"
                >
                  <div className="text-xs uppercase tracking-wide text-red-100 mb-1">
                    {category.replace('-', ' ')}
                  </div>
                  <div className="text-lg font-bold">
                    {formatCurrency(amount)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Controls Section */}
      <div className="sticky top-0 z-30 bg-white shadow-md border-b-2 border-gray-200">
        <div className="container mx-auto px-4 sm:px-6 md:px-8 py-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            {/* Search */}
            <div className="w-full sm:w-64">
              <input
                type="text"
                placeholder="Search rat holes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-canadian-red text-sm"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              {/* Category Filter */}
              <select
                value={categoryFilter}
                onChange={(e) =>
                  setCategoryFilter(e.target.value as CategoryFilter)
                }
                className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-canadian-red text-sm font-semibold"
              >
                <option value="all">All Categories</option>
                <option value="ngo">NGO</option>
                <option value="lgbt">LGBT+</option>
                <option value="foreign-aid">Foreign Aid</option>
                <option value="corporate">Corporate</option>
                <option value="other">Other</option>
              </select>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-canadian-red text-sm font-semibold"
              >
                <option value="amount">Sort by Amount</option>
                <option value="date">Sort by Date</option>
                <option value="title">Sort by Title</option>
              </select>
            </div>
          </div>

          {/* Results count */}
          <div className="mt-3 text-sm text-gray-600">
            Showing <span className="font-bold">{filteredAndSortedHoles.length}</span>{' '}
            of <span className="font-bold">{ratHoles.length}</span> rat holes
          </div>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="relative z-20 container mx-auto px-4 sm:px-6 md:px-8 py-8 md:py-12">
        {filteredAndSortedHoles.length > 0 ? (
          <div
            className="grid gap-6 md:gap-8"
            style={{
              gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))`,
            }}
          >
            {filteredAndSortedHoles.map((hole) => (
              <RatHoleCard key={hole.id} ratHole={hole} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold text-gray-700 mb-2">
              No rat holes found
            </h3>
            <p className="text-gray-600">
              Try adjusting your search or filter criteria
            </p>
          </div>
        )}
      </div>

      {/* Disclaimer Footer */}
      <div className="bg-gray-100 border-t-2 border-gray-300 py-8">
        <div className="container mx-auto px-4 sm:px-6 md:px-8">
          <div className="max-w-4xl mx-auto text-center text-sm text-gray-600">
            <p className="mb-2">
              <strong>Disclaimer:</strong> This page tracks publicly reported
              government spending that raises questions about value for Canadian
              taxpayers. All data is sourced from official government announcements
              and reputable media outlets.
            </p>
            <p>
              The term "rat hole" refers to spending with questionable
              accountability, unclear benefits, or lack of transparency - not
              necessarily illegal activity.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
