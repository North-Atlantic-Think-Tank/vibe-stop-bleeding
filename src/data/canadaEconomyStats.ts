// Canada Economy Statistics Configuration
// Data Source: canada_economy_stats.md
// Last Updated: November 2025

export interface EconomyStatWidget {
  id: string;
  title: string;
  currentValue: number;
  unit: string;
  prefix?: string;
  suffix?: string;
  perSecondIncrease: number;
  year2024Value: number;
  year2023Value: number;
  keyInsights: string[];
  fullDescription: string;
  format?: 'currency' | 'number' | 'percentage';
  decimals?: number;
  isNegativeGood?: boolean; // For metrics where lower is better
}

export const economyWidgets: EconomyStatWidget[] = [
  {
    id: 'credit-card-debt',
    title: 'Average Credit Card Debt',
    currentValue: 4681, // Average per borrower in CAD
    unit: 'CAD',
    prefix: '$',
    perSecondIncrease: 361,
    year2024Value: 4681,
    year2023Value: 4119,
    format: 'currency',
    decimals: 0,
    keyInsights: [
      '31 consecutive months of year-over-year balance growth',
      '64% of balances are revolving (carried month-to-month)',
      '54% of Canadians have credit card debt',
      'Delinquency rates: 0.93% in Q4 2024',
    ],
    fullDescription:
      'Total consumer credit balances reached approximately $2.52 trillion in Q2 2025, a 4.4% year-over-year increase. The average credit card balance per Canadian was estimated at $4,499 in Q1 2025. Approximately 1.4 million Canadians missed at least one credit payment in Q1 2025, a level not seen since 2009.',
  },
  {
    id: 'household-debt',
    title: 'Household Debt',
    currentValue: 61538, // Per capita in CAD
    unit: 'CAD',
    prefix: '$',
    perSecondIncrease: 3736,
    year2024Value: 61538,
    year2023Value: 58894,
    format: 'currency',
    decimals: 0,
    keyInsights: [
      'Highest household debt among G7 countries',
      'Debt-to-income ratio: 171.9% of gross income',
      'Average net worth per household: ~$1 million',
      'Top 20% hold 68.1% of financial assets',
    ],
    fullDescription:
      'Total household debt reached $2.56 trillion CAD in Q4 2024. Per capita household debt is approximately $61,538 CAD. Non-mortgage debt per consumer is $21,931 CAD, exceeding pre-pandemic levels. The debt-to-income ratio stands at 171.9% of gross income as of Q1 2025.',
  },
  {
    id: 'national-debt',
    title: 'National Debt',
    currentValue: 34709, // Per capita federal debt in CAD
    unit: 'CAD',
    prefix: '$',
    perSecondIncrease: 2752,
    year2024Value: 34709,
    year2023Value: 33000,
    format: 'currency',
    decimals: 0,
    keyInsights: [
      'Federal net debt: $1,445 billion CAD (Nov 2025)',
      'Per taxpayer: $43,551 CAD',
      'Debt-to-GDP ratio: 110.8% (2024)',
      'No federal balanced budget legislation',
    ],
    fullDescription:
      'Federal net debt stands at $1,445 billion CAD as of November 2025, translating to $34,709 CAD per capita and $43,551 CAD per taxpayer. The debt-to-GDP ratio is 110.8% in 2024. Debt has been increasing since 2014 in both absolute and GDP percentage terms.',
  },
  {
    id: 'unemployment',
    title: 'Unemployment Amount',
    currentValue: 1500000, // Unemployment people amount
    unit: 'people',
    perSecondIncrease: 5.3, // People becoming unemployed per second
    year2024Value: 6.7,
    year2023Value: 5.5,
    format: 'number',
    decimals: 1,
    keyInsights: [
      'Total unemployed: ~1.5 million people',
      'Long-term unemployment (27+ weeks): 23.7%',
      'Youth unemployment (15-24): 14.2%',
      '1.8M jobs (8.8%) depend on US demand',
    ],
    fullDescription:
      'Unemployment rate stands at 6.9% as of October 2025, down from 7.1% in September. Approximately 1.5 million people are unemployed out of a labor force of ~21.7 million. The number of unemployed increased by 276,000 (+22.2%) year-over-year in November 2024.',
  },
  {
    id: 'homelessness',
    title: 'Homelessness',
    currentValue: 67000, // Estimated total people
    unit: 'people',
    perSecondIncrease: 0.48,
    year2024Value: 67000,
    year2023Value: 53600,
    format: 'number',
    decimals: 0,
    keyInsights: [
      'Point-in-time count: 60,000 (Fall 2024)',
      '79% increase since last count (2020-22)',
      'Toronto: 111% increase since April 2021',
      '33.1% identify as Indigenous',
    ],
    fullDescription:
      'Point-in-time count across 74 communities found 60,000 people experiencing homelessness in Fall 2024. Estimated total across all communities is 67,000+. Annual homelessness estimate ranges from 150,000 to 300,000 people. Primary causes include insufficient income (41%), lack of affordable housing (41%), and mental health issues (44%).',
  },
  {
    id: 'food-insecurity',
    title: 'Food Insecurity',
    currentValue: 10000000, // Total people affected
    unit: 'people',
    perSecondIncrease: 41,
    year2024Value: 10000000,
    year2023Value: 8700000,
    format: 'number',
    decimals: 0,
    keyInsights: [
      '25.5% of Canadian population affected',
      'Children affected: 2.5 million',
      'Severe food insecurity: 2.6 million',
      'Highest in 20 years of monitoring',
    ],
    fullDescription:
      '10 million Canadians (25.5% of population) are affected by food insecurity in 2024, including 2.5 million children. Severe food insecurity affects 2.6 million people. Provincial rates range from 13.8% (Quebec) to 30.9% (Alberta). Territorial rates are much higher: Nunavut 58.1%, NWT 22.2%.',
  },
  {
    id: 'infrastructure-investment',
    title: 'Infrastructure Investment',
    currentValue: 300000000000, // Total value in CAD
    unit: 'CAD',
    prefix: '$',
    perSecondIncrease: 1028,
    year2024Value: 300000000000,
    year2023Value: 292000000000,
    format: 'currency',
    decimals: 0,
    keyInsights: [
      'Top 100 projects: $300+ billion',
      '2025 new projects: $22 billion',
      'Federal plan: $115.2B over 5 years',
      'Infrastructure deficit: $270 billion',
    ],
    fullDescription:
      'Top 100 infrastructure projects total over $300 billion CAD in projected value. Federal spending plan allocates $115.2 billion over 5 years. Major programs include Build Communities Strong Fund ($51B over 10 years), Home Building Initiatives ($25B over 5 years), and Trade Diversification Corridors ($10B over 7 years).',
  },
  {
    id: 'public-wellbeing',
    title: 'Public Well-being',
    currentValue: 200000000000, // Estimated annual spending in CAD
    unit: 'CAD',
    prefix: '$',
    perSecondIncrease: 6342,
    year2024Value: 200000000000,
    year2023Value: 192000000000,
    format: 'currency',
    decimals: 0,
    keyInsights: [
      'Healthcare spending growth: 3-4.5% annually',
      'Social housing: $3B over 3 years (Ontario)',
      'Homelessness programs: ~$2.1B (municipal)',
      'Federal social transfers: billions annually',
    ],
    fullDescription:
      'Estimated combined public well-being spending on healthcare, social services, and housing totals approximately $200 billion annually. Healthcare spending is projected to grow 3-4.5% annually. Major investments include social housing ($3 billion over 3 years in Ontario) and homelessness programs (~$2.1 billion in municipal spending).',
  },
  {
    id: 'imports',
    title: 'Imports',
    currentValue: 607000000000, // Total imports in CAD
    unit: 'CAD',
    prefix: '$',
    perSecondIncrease: 19248,
    year2024Value: 607000000000,
    year2023Value: 600000000000,
    format: 'currency',
    decimals: 0,
    keyInsights: [
      'US imports: $377B CAD (62.2% of total)',
      'Consumer goods at record high: $56.9B',
      'Energy imports: $39.0B (declining)',
      'Monthly average: $85.3B (Aug 2025)',
    ],
    fullDescription:
      'Total imports reached approximately $607 billion CAD in 2024. Imports from the US account for $377.0 billion CAD (+0.9% from 2023), representing 62.2% of total imports. Consumer goods imports hit a record high of $56.9 billion, while energy imports totaled $39.0 billion.',
  },
  {
    id: 'exports',
    title: 'Exports',
    currentValue: 721000000000, // Total exports in CAD
    unit: 'CAD',
    prefix: '$',
    perSecondIncrease: 22860,
    year2024Value: 721000000000,
    year2023Value: 713000000000,
    format: 'currency',
    decimals: 0,
    keyInsights: [
      'US exports: $547.4B (75.9% of total)',
      'Energy exports: $176.2B (largest)',
      'Trade surplus: $14.8B overall',
      'US trade surplus: $102.3B',
    ],
    fullDescription:
      'Total exports reached approximately $721 billion CAD in 2024. Exports to the US total $547.4 billion CAD (flat 0.0% growth), representing 75.9% of Canadian exports. Energy exports ($176.2 billion) form the largest category. Canada maintains a trade surplus of $14.8 billion overall.',
  },
  {
    id: 'foreign-aid',
    title: 'Foreign Economic Aid',
    currentValue: 8500000000, // ODA in CAD (2024 estimate)
    unit: 'CAD',
    prefix: '$',
    perSecondIncrease: 270,
    year2024Value: 8500000000,
    year2023Value: 8100000000,
    format: 'currency',
    decimals: 0,
    keyInsights: [
      '2023 ODA: $8.1B (0.33% of GNI)',
      'UN target: 0.7% of GNI',
      'Major recipients: Ukraine, humanitarian crises',
      'Includes bilateral and multilateral aid',
    ],
    fullDescription:
      'Official Development Assistance (ODA) is estimated at $8.5-9.0 billion CAD in 2024, up from $8.1 billion in 2023 (0.33% of GNI). Canada is committed to increasing ODA toward the 0.7% GNI target recommended by the UN. Major recipients include Ukraine, humanitarian crises, and climate adaptation projects.',
  },
  {
    id: 'public-service-spending',
    title: 'Public Service Spending',
    currentValue: 450000000000, // Program spending in CAD
    unit: 'CAD',
    prefix: '$',
    perSecondIncrease: 14269,
    year2024Value: 450000000000,
    year2023Value: 435000000000,
    format: 'currency',
    decimals: 0,
    keyInsights: [
      'Federal spending: ~$500B (2025-26)',
      'Deficit: $78.3B projected',
      'Social transfers: largest component',
      'Debt servicing costs rising',
    ],
    fullDescription:
      'Federal government spending is projected at approximately $500 billion CAD for 2025-26, with a deficit of $78.3 billion. Program spending (excluding debt servicing) totals around $450 billion. Major categories include social transfers for healthcare and social programs, defense and security, and operations and administration.',
  },
];

// Helper function to format numbers
export function formatValue(value: number, widget: EconomyStatWidget): string {
  const { format = 'number', decimals = 0, prefix = '', suffix = '' } = widget;

  let formatted: string;

  if (format === 'currency' || format === 'number') {
    if (value >= 1000000000) {
      formatted = (value / 1000000000).toFixed(decimals) + 'B';
    } else if (value >= 1000000) {
      formatted = (value / 1000000).toFixed(decimals) + 'M';
    } else if (value >= 1000) {
      // formatted = (value / 1000).toFixed(decimals) + 'K';
      formatted = value.toFixed(decimals);
    } else {
      formatted = value.toFixed(decimals);
    }
  } else {
    formatted = value.toFixed(decimals);
  }

  return `${prefix}${formatted}${suffix}`;
}

// Calculate comparison percentages
export function calculateChangePercent(
  current: number,
  previous: number,
): number {
  if (current < 100 && previous < 100) return current - previous;
  return ((current - previous) / previous) * 100;
}

export function getChangeColor(
  percent: number,
  isNegativeGood: boolean = false,
): string {
  const isPositive = percent > 0;
  const palette = {
    green: '#10B981',
    red: '#EF4444',
  };
  if (isNegativeGood) {
    return isPositive ? palette.green : palette.red; // Green if increase, red if decrease
  }

  return isPositive ? palette.red : palette.green; // Red if increase, green if decrease
}
