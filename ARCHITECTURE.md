# System Architecture

## Agent Team Overview

```
┌─────────────────────────────────────────────────────────────┐
│                  stopbleeding.ca AI Team                     │
└─────────────────────────────────────────────────────────────┘

┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│   Editor     │      │  Developer   │      │   Workflow   │
│    Agent     │      │    Agent     │      │ Coordinator  │
│              │      │              │      │              │
│ • Research   │      │ • Build site │      │ • Orchestrate│
│ • Write      │      │ • Visualize  │      │ • Schedule   │
│ • Analyze    │      │ • Deploy     │      │ • Monitor    │
└──────┬───────┘      └──────┬───────┘      └──────┬───────┘
       │                     │                     │
       │                     │                     │
       └─────────────────────┴─────────────────────┘
                            │
                            ▼
                ┌───────────────────────┐
                │  Shared Utilities     │
                │                       │
                │ • Orchestrator        │
                │ • Data Converter      │
                │ • Type Validation     │
                │ • Scheduler           │
                └───────────────────────┘
```

## Data Flow Diagram

```
┌─────────────┐
│    User     │
│  or Cron    │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────────┐
│      Workflow Coordinator               │
│  (Analyzes task & plans execution)      │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│         Editor Agent                    │
│  1. Research Canadian news sources      │
│  2. Identify trending topics            │
│  3. Write analysis article              │
│  4. Structure data for charts           │
│  5. Cite sources                        │
└──────┬──────────────────────────────────┘
       │
       │ (Outputs JSON)
       ▼
┌─────────────────────────────────────────┐
│  {                                      │
│    "title": "...",                      │
│    "content": "...",                    │
│    "charts": [...],                     │
│    "sources": [...]                     │
│  }                                      │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│      Data Converter                     │
│  • Validates JSON schema                │
│  • Converts to Markdown                 │
│  • Generates RSS feed                   │
└──────┬──────────────────────────────────┘
       │
       ├──────────────────┬────────────────┐
       ▼                  ▼                ▼
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│  Markdown   │  │  RSS Feed   │  │ Chart Data  │
│   Article   │  │             │  │    JSON     │
└─────────────┘  └─────────────┘  └─────────────┘
       │                  │                │
       └──────────────────┴────────────────┘
                         │
                         ▼
              ┌──────────────────┐
              │  Developer Agent │
              │  (Publishes to   │
              │   website)       │
              └──────────────────┘
```

## Daily Automated Workflow

```
09:00 ET ┌─────────────────────────┐
         │  Research Phase         │
         │  • Scan news sources    │
         │  • Identify trends      │
         └───────────┬─────────────┘
                     │
11:00 ET            ▼
         ┌─────────────────────────┐
         │  Selection Phase        │
         │  • Choose top story     │
         │  • Plan article         │
         └───────────┬─────────────┘
                     │
14:00 ET            ▼
         ┌─────────────────────────┐
         │  Writing Phase          │
         │  • Write full article   │
         │  • Add data/charts      │
         │  • Cite sources         │
         └───────────┬─────────────┘
                     │
16:00 ET            ▼
         ┌─────────────────────────┐
         │  Publishing Phase       │
         │  • Convert to markdown  │
         │  • Generate RSS         │
         │  • Deploy to site       │
         └───────────┬─────────────┘
                     │
18:00 ET            ▼
         ┌─────────────────────────┐
         │  Distribution Phase     │
         │  • Social media posts   │
         │  • Newsletter send      │
         └─────────────────────────┘
```

## File System Layout

```
vibe-stop-bleeding/
│
├── agents/                      ← AI Agent System
│   ├── editor/                  ← Content Creation
│   │   ├── prompt.md           → System prompt
│   │   ├── research.js         → Research script
│   │   └── write.js            → Writing script
│   │
│   ├── developer/               ← Technical Work
│   │   ├── prompt.md           → System prompt
│   │   └── setup.js            → Development script
│   │
│   ├── workflow/                ← Coordination
│   │   ├── prompt.md           → System prompt
│   │   ├── daily-cycle.js      → Automated workflow
│   │   └── publish.js          → Publishing script
│   │
│   └── shared/                  ← Common Utilities
│       ├── orchestrator.js     → Multi-agent coordination
│       ├── types.js            → Data schemas
│       ├── data-converter.js   → Format conversion
│       └── scheduler.js        → Automation
│
├── content/                     ← Content Storage
│   ├── articles/               → Published articles
│   │   ├── *.json             → Structured data
│   │   └── *.md               → Markdown files
│   └── drafts/                 → Work in progress
│       └── research-*.md       → Research notes
│
├── public/                      ← Public Assets
│   ├── images/                 → Article images
│   └── data/                   → Chart data
│       └── *-charts.json       → Visualization data
│
├── docs/                        ← Documentation
│   ├── README.md               → Main documentation
│   ├── QUICKSTART.md           → Quick setup
│   ├── AGENT_GUIDE.md          → Agent details
│   ├── ARCHITECTURE.md         → This file
│   └── PROJECT_SUMMARY.md      → Project overview
│
└── config/                      ← Configuration
    ├── package.json            → Dependencies & scripts
    ├── .env.example            → Environment template
    └── .gitignore              → Git ignore rules
```

## Agent Communication Protocol

```
┌─────────────────────────────────────────────────────────┐
│                    Communication Flow                    │
└─────────────────────────────────────────────────────────┘

Agent A                     Agent B
  │                           │
  ├─► 1. Task Request         │
  │   (via Orchestrator)      │
  │                           │
  │   2. Process Task       ◄─┤
  │                           │
  ├─► 3. Output JSON          │
  │   (standardized format)   │
  │                           │
  │   4. Validate & Parse   ◄─┤
  │                           │
  ├─► 5. Context for Next     │
  │   (pass to Agent B)       │
  │                           │
  │                         ◄─┤ 6. Agent B Executes
  │                           │
  ├─► 7. Combined Results     │
  │                           │
  └───────────────────────────┘
```

## Technology Stack

```
┌──────────────────────────────────────────┐
│           Frontend (Planned)             │
│  Astro + React + Tailwind CSS            │
└───────────────┬──────────────────────────┘
                │
┌───────────────▼──────────────────────────┐
│         Content Layer                    │
│  Markdown + JSON + MDX                   │
└───────────────┬──────────────────────────┘
                │
┌───────────────▼──────────────────────────┐
│         AI Agent Layer                   │
│  Node.js + Claude Sonnet 4.5             │
└───────────────┬──────────────────────────┘
                │
┌───────────────▼──────────────────────────┐
│         Data Layer                       │
│  File System + JSON Schema               │
└───────────────┬──────────────────────────┘
                │
┌───────────────▼──────────────────────────┐
│      Infrastructure (Planned)            │
│  Vercel/Netlify + GitHub Actions         │
└──────────────────────────────────────────┘
```

## Agent Specializations

```
┌─────────────────────────────────────────────────────┐
│                  Editor Agent                       │
│                                                     │
│  Specializations:                                   │
│  ├─ Canadian News Analysis                         │
│  ├─ Economic Data Interpretation                   │
│  ├─ Employment Trends                              │
│  ├─ Political Coverage                             │
│  └─ Educational Policy                             │
│                                                     │
│  Outputs:                                           │
│  • Long-form articles (800-1500 words)             │
│  • Data recommendations for charts                 │
│  • Source citations                                │
│  • SEO metadata                                    │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│                Developer Agent                      │
│                                                     │
│  Specializations:                                   │
│  ├─ Astro Framework                                │
│  ├─ React Components                               │
│  ├─ Data Visualization (Recharts)                  │
│  ├─ Performance Optimization                       │
│  └─ Deployment Automation                          │
│                                                     │
│  Outputs:                                           │
│  • Production-ready code                           │
│  • Component libraries                             │
│  • Deployment configurations                       │
│  • Technical documentation                         │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│             Workflow Coordinator                    │
│                                                     │
│  Specializations:                                   │
│  ├─ Task Analysis                                  │
│  ├─ Agent Selection                                │
│  ├─ Execution Planning                             │
│  ├─ Error Handling                                 │
│  └─ Quality Assurance                              │
│                                                     │
│  Outputs:                                           │
│  • Execution plans                                 │
│  • Coordination logs                               │
│  • Status reports                                  │
│  • Error diagnostics                               │
└─────────────────────────────────────────────────────┘
```

## Scalability Considerations

### Horizontal Scaling
- Multiple Editor agents for different topics
- Parallel article generation
- Distributed research tasks

### Vertical Scaling
- Enhanced prompts for deeper analysis
- Larger context windows
- More sophisticated data processing

### Future Enhancements
- SEO Agent for optimization
- Social Media Agent for distribution
- Analytics Agent for performance tracking
- Image Generation Agent for visuals

## Security Architecture

```
┌─────────────────────────────────────┐
│         Security Layers             │
└─────────────────────────────────────┘

1. API Key Management
   ├─ Stored in .env (not in git)
   ├─ Never logged or exposed
   └─ Rotated periodically

2. Content Validation
   ├─ Schema validation
   ├─ Source verification
   └─ Fact-checking required

3. Output Sanitization
   ├─ XSS prevention
   ├─ SQL injection protection
   └─ Safe markdown rendering

4. Access Control
   ├─ Agent-specific permissions
   ├─ Rate limiting
   └─ Audit logging
```

## Deployment Pipeline

```
┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐
│  Local   │──▶│  GitHub  │──▶│   Build  │──▶│   Live   │
│  Dev     │   │  Commit  │   │  Deploy  │   │   Site   │
└──────────┘   └──────────┘   └──────────┘   └──────────┘
     │              │              │              │
     │              │              │              │
   Test         Version        CI/CD          Monitor
   Agents       Control        Pipeline       Analytics
```

---

**Last Updated**: November 14, 2025

**Version**: 1.0

**Status**: Architecture Defined, Implementation Ready
