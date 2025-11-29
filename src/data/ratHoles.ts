// Rat Holes - Tracking Questionable Government Spending
// Data Model for Canadian taxpayer money flowing to NGOs, organizations, and other entities
// Last Updated: November 2025

export interface Stakeholder {
  name: string;
  link?: string;
  role?: string; // e.g., "Minister", "CEO", "Board Member"
}

export interface Source {
  title: string;
  link: string;
  date?: string;
  publisher?: string; // e.g., "CBC", "Globe and Mail"
}

export interface RatHole {
  id: string;
  title: string;
  amount: number; // In CAD
  abstract: string; // Brief description of the spending
  entity: string; // Who received the money
  category: 'ngo' | 'lgbt' | 'foreign-aid' | 'corporate' | 'other';
  date: string; // When the spending occurred or was announced
  stakeholders: Stakeholder[];
  sources: Source[];
  tags?: string[];
  status?: 'ongoing' | 'completed' | 'under-investigation';
}

export const ratHoles: RatHole[] = [
  {
    id: 'wef-partnership',
    title: 'World Economic Forum Partnership Funding',
    amount: 387000000,
    abstract:
      'Funding allocated to various WEF initiatives and partnerships, including climate action programs and global governance projects with limited transparency on Canadian benefits.',
    entity: 'World Economic Forum',
    category: 'ngo',
    date: '2023-06-15',
    stakeholders: [
      {
        name: 'Chrystia Freeland',
        role: 'Deputy Prime Minister & Minister of Finance',
        link: 'https://www.canada.ca/en/department-finance.html',
      },
      {
        name: 'Klaus Schwab',
        role: 'WEF Founder',
        link: 'https://www.weforum.org',
      },
    ],
    sources: [
      {
        title: 'Canada deepens WEF partnership with major funding',
        link: 'https://example.com/wef-funding',
        date: '2023-06-15',
        publisher: 'National Post',
      },
    ],
    tags: ['international', 'climate', 'controversial'],
    status: 'ongoing',
  },
  {
    id: 'pride-grants-2024',
    title: 'Pride Festival Grants Program',
    amount: 12500000,
    abstract:
      'Federal grants distributed to 47 Pride organizations across Canada for festival operations, with concerns raised about accountability and measurable community benefits.',
    entity: 'Various Pride Organizations',
    category: 'lgbt',
    date: '2024-03-20',
    stakeholders: [
      {
        name: 'Marci Ien',
        role: 'Minister for Women and Gender Equality',
        link: 'https://www.canada.ca/en/women-gender-equality.html',
      },
    ],
    sources: [
      {
        title: 'Federal government announces Pride grants',
        link: 'https://example.com/pride-grants',
        date: '2024-03-20',
        publisher: 'CBC News',
      },
      {
        title: 'Questions raised over Pride funding transparency',
        link: 'https://example.com/pride-accountability',
        date: '2024-04-10',
        publisher: 'True North',
      },
    ],
    tags: ['grants', 'social-programs', 'accountability'],
    status: 'completed',
  },
  {
    id: 'ukraine-aid-2024',
    title: 'Ukraine Financial Aid Package',
    amount: 4800000000,
    abstract:
      'Multi-billion dollar aid package to Ukraine including military equipment, humanitarian assistance, and budget support with limited oversight on fund allocation.',
    entity: 'Government of Ukraine',
    category: 'foreign-aid',
    date: '2024-02-10',
    stakeholders: [
      {
        name: 'Justin Trudeau',
        role: 'Prime Minister',
        link: 'https://pm.gc.ca',
      },
      {
        name: 'Mélanie Joly',
        role: 'Minister of Foreign Affairs',
        link: 'https://www.canada.ca/en/global-affairs.html',
      },
    ],
    sources: [
      {
        title: 'Canada announces additional Ukraine support',
        link: 'https://example.com/ukraine-aid',
        date: '2024-02-10',
        publisher: 'Global News',
      },
    ],
    tags: ['foreign-aid', 'military', 'international'],
    status: 'ongoing',
  },
  {
    id: 'battery-plant-subsidies',
    title: 'Electric Vehicle Battery Plant Subsidies',
    amount: 13200000000,
    abstract:
      'Production subsidies to Volkswagen and Stellantis for EV battery plants in Ontario, matching U.S. Inflation Reduction Act benefits with unclear job guarantees.',
    entity: 'Volkswagen & Stellantis',
    category: 'corporate',
    date: '2023-04-21',
    stakeholders: [
      {
        name: 'François-Philippe Champagne',
        role: 'Minister of Innovation, Science and Industry',
      },
      {
        name: 'Doug Ford',
        role: 'Premier of Ontario',
      },
    ],
    sources: [
      {
        title: 'Ottawa commits billions in EV subsidies',
        link: 'https://example.com/ev-subsidies',
        date: '2023-04-21',
        publisher: 'Globe and Mail',
      },
      {
        title: 'Questions over auto sector subsidy value',
        link: 'https://example.com/subsidy-concerns',
        date: '2023-05-15',
        publisher: 'Financial Post',
      },
    ],
    tags: ['corporate-welfare', 'green-energy', 'manufacturing'],
    status: 'ongoing',
  },
  {
    id: 'african-development-fund',
    title: 'African Development Bank Contribution',
    amount: 845000000,
    abstract:
      'Five-year commitment to African Development Bank for infrastructure and development projects with minimal Canadian contractor involvement or direct benefits.',
    entity: 'African Development Bank',
    category: 'foreign-aid',
    date: '2023-11-08',
    stakeholders: [
      {
        name: 'Ahmed Hussen',
        role: 'Minister of International Development',
      },
    ],
    sources: [
      {
        title: 'Canada increases African development funding',
        link: 'https://example.com/africa-fund',
        date: '2023-11-08',
        publisher: 'CBC News',
      },
    ],
    tags: ['foreign-aid', 'africa', 'development'],
    status: 'ongoing',
  },
  {
    id: 'media-bailout-2024',
    title: 'Legacy Media Subsidy Program',
    amount: 595000000,
    abstract:
      'Annual subsidies to legacy media organizations through tax credits and direct funding, raising concerns about media independence and bias.',
    entity: 'Various Canadian Media Companies',
    category: 'corporate',
    date: '2024-01-12',
    stakeholders: [
      {
        name: 'Pascale St-Onge',
        role: 'Minister of Canadian Heritage',
      },
    ],
    sources: [
      {
        title: 'Media bailout extended for another year',
        link: 'https://example.com/media-subsidy',
        date: '2024-01-12',
        publisher: 'National Post',
      },
      {
        title: 'Questions about media subsidy impact on journalism',
        link: 'https://example.com/media-independence',
        date: '2024-01-20',
        publisher: 'True North',
      },
    ],
    tags: ['media', 'subsidies', 'journalism'],
    status: 'ongoing',
  },
  {
    id: 'indigenous-water-settlement',
    title: 'First Nations Water Settlement',
    amount: 8000000000,
    abstract:
      'Compensation and infrastructure funding for First Nations communities affected by boil water advisories, with concerns about project delays and cost overruns.',
    entity: 'Assembly of First Nations',
    category: 'ngo',
    date: '2023-07-30',
    stakeholders: [
      {
        name: 'Patty Hajdu',
        role: 'Minister of Indigenous Services',
      },
    ],
    sources: [
      {
        title: 'Historic water settlement reached with First Nations',
        link: 'https://example.com/water-settlement',
        date: '2023-07-30',
        publisher: 'CBC News',
      },
      {
        title: 'Water infrastructure projects face delays',
        link: 'https://example.com/water-delays',
        date: '2024-05-15',
        publisher: 'Globe and Mail',
      },
    ],
    tags: ['indigenous', 'infrastructure', 'settlement'],
    status: 'ongoing',
  },
  {
    id: 'climate-ngo-grants',
    title: 'Climate Action NGO Grants',
    amount: 275000000,
    abstract:
      'Grants to environmental NGOs for climate advocacy and awareness campaigns, with limited metrics on emission reduction impact.',
    entity: 'Various Environmental NGOs',
    category: 'ngo',
    date: '2024-04-22',
    stakeholders: [
      {
        name: 'Steven Guilbeault',
        role: 'Minister of Environment and Climate Change',
      },
    ],
    sources: [
      {
        title: 'Earth Day climate grants announced',
        link: 'https://example.com/climate-grants',
        date: '2024-04-22',
        publisher: 'CTV News',
      },
    ],
    tags: ['climate', 'ngo', 'environment'],
    status: 'ongoing',
  },
  {
    id: 'telecom-rural-subsidy',
    title: 'Rural Broadband Telecom Subsidies',
    amount: 3200000000,
    abstract:
      'Subsidies to major telecoms (Bell, Rogers, Telus) for rural internet expansion, despite companies reporting record profits and maintaining high consumer prices.',
    entity: 'Bell Canada, Rogers, Telus',
    category: 'corporate',
    date: '2023-09-14',
    stakeholders: [
      {
        name: 'François-Philippe Champagne',
        role: 'Minister of Innovation, Science and Industry',
      },
    ],
    sources: [
      {
        title: 'Billions for rural internet expansion',
        link: 'https://example.com/broadband-subsidy',
        date: '2023-09-14',
        publisher: 'Globe and Mail',
      },
      {
        title: 'Telecom profits soar despite public subsidies',
        link: 'https://example.com/telecom-profits',
        date: '2024-02-08',
        publisher: 'Financial Post',
      },
    ],
    tags: ['telecoms', 'infrastructure', 'corporate-welfare'],
    status: 'ongoing',
  },
  {
    id: 'diversity-consulting',
    title: 'DEI Consulting Contracts',
    amount: 147000000,
    abstract:
      'Federal contracts for diversity, equity, and inclusion consulting services across government departments with unclear deliverables and effectiveness metrics.',
    entity: 'Various DEI Consulting Firms',
    category: 'other',
    date: '2023-12-05',
    stakeholders: [
      {
        name: 'Anita Anand',
        role: 'President of the Treasury Board',
      },
    ],
    sources: [
      {
        title: 'Federal DEI spending revealed',
        link: 'https://example.com/dei-contracts',
        date: '2023-12-05',
        publisher: 'National Post',
      },
    ],
    tags: ['consulting', 'dei', 'government-spending'],
    status: 'ongoing',
  },
  {
    id: 'international-climate-fund',
    title: 'International Climate Finance',
    amount: 5300000000,
    abstract:
      'Five-year commitment to international climate finance for developing countries, with limited tracking of Canadian involvement in funded projects.',
    entity: 'UN Climate Fund & Various Countries',
    category: 'foreign-aid',
    date: '2023-10-12',
    stakeholders: [
      {
        name: 'Steven Guilbeault',
        role: 'Minister of Environment and Climate Change',
      },
    ],
    sources: [
      {
        title: 'Canada boosts climate finance pledge',
        link: 'https://example.com/climate-finance',
        date: '2023-10-12',
        publisher: 'CBC News',
      },
    ],
    tags: ['climate', 'foreign-aid', 'international'],
    status: 'ongoing',
  },
  {
    id: 'quebec-daycare-transfer',
    title: 'Quebec Childcare Transfer Payment',
    amount: 6000000000,
    abstract:
      'Federal transfer to Quebec for childcare system despite province already having established program, with no strings attached on service improvements.',
    entity: 'Government of Quebec',
    category: 'other',
    date: '2024-03-28',
    stakeholders: [
      {
        name: 'Karina Gould',
        role: 'Minister of Families, Children and Social Development',
      },
      {
        name: 'François Legault',
        role: 'Premier of Quebec',
      },
    ],
    sources: [
      {
        title: 'Quebec childcare funding agreement signed',
        link: 'https://example.com/quebec-childcare',
        date: '2024-03-28',
        publisher: 'La Presse',
      },
    ],
    tags: ['childcare', 'quebec', 'transfers'],
    status: 'completed',
  },
];

// Helper function to format currency
export function formatCurrency(amount: number): string {
  if (amount >= 1000000000) {
    return `$${(amount / 1000000000).toFixed(2)}B`;
  } else if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`;
  } else if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(0)}K`;
  }
  return `$${amount.toLocaleString()}`;
}

// Calculate total spending
export function getTotalSpending(): number {
  return ratHoles.reduce((total, hole) => total + hole.amount, 0);
}

// Get spending by category
export function getSpendingByCategory(category: RatHole['category']): number {
  return ratHoles
    .filter((hole) => hole.category === category)
    .reduce((total, hole) => total + hole.amount, 0);
}

// Sort options
export function sortRatHoles(
  holes: RatHole[],
  sortBy: 'amount' | 'date' | 'title',
): RatHole[] {
  const sorted = [...holes];

  switch (sortBy) {
    case 'amount':
      return sorted.sort((a, b) => b.amount - a.amount);
    case 'date':
      return sorted.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      );
    case 'title':
      return sorted.sort((a, b) => a.title.localeCompare(b.title));
    default:
      return sorted;
  }
}

// Filter by category
export function filterByCategory(
  holes: RatHole[],
  category?: RatHole['category'],
): RatHole[] {
  if (!category) return holes;
  return holes.filter((hole) => hole.category === category);
}
