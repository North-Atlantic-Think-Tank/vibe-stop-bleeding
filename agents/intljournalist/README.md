# International Investigative Journalist Agent

This agent specializes in investigating **international market interference, trade disputes, geopolitical economic coercion, and cross-border business disruptions**.

## Purpose

While the main `stopbleeding.ca` platform focuses on Canadian domestic issues, this agent investigates global affairs including:
- State-sponsored market interference
- International trade disputes
- Geopolitical economic coercion
- Cultural and political censorship in commerce
- Regulatory discrimination against foreign entities

## Quick Start

### Setup
Ensure you have `ANTHROPIC_API_KEY` set in your `.env` file:
```bash
ANTHROPIC_API_KEY=your_api_key_here
```

### Run an Investigation

```bash
# Basic investigation
npm run intl:investigate -- "Investigation topic"

# Investigation with additional context
npm run intl:investigate -- "Investigation topic" "Additional context or focus areas"
```

## Example Investigations

### 1. Cultural Censorship Patterns
```bash
npm run intl:investigate -- "China's administrative interference in Japanese cultural events" "Focus on entertainment industry targeting in 2025"
```

This will investigate:
- Multiple cases of Japanese artists/performers targeted
- Pattern analysis (systematic vs. isolated)
- Geopolitical context (Japan-China tensions)
- Economic impact on entertainment industry
- International response

### 2. Trade Pledge Gaps
```bash
npm run intl:investigate -- "Discrepancies between China's soybean purchase pledges and actual imports from the US"
```

This will investigate:
- Pledged amounts vs. actual purchase data
- Timeline of commitments and deliveries
- Potential political or economic reasons for gaps
- Impact on US farmers and Chinese consumers
- WTO trade agreement implications

### 3. Regulatory Discrimination
```bash
npm run intl:investigate -- "China's mandatory domestic AI chip requirements for state-funded data centers"
```

This will investigate:
- Official policy and implementation timeline
- Which foreign companies are affected
- WTO non-discrimination rule violations
- Economic impact on foreign semiconductor companies
- Comparative analysis with other countries' localization requirements

### 4. Multi-Case Pattern Investigation
```bash
npm run intl:investigate -- "Systematic market interference actions by China targeting foreign businesses in 2025"
```

This will investigate:
- Multiple cases across different sectors (entertainment, tech, agriculture, etc.)
- Common patterns and triggers
- Sectoral and country-specific targeting
- Escalation timeline
- Broader geopolitical implications

## Output Files

After running an investigation, you'll find outputs in:

### Investigation Report (JSON)
`content/international-investigations/investigation-YYYY-MM-DD-slug.json`

Contains complete structured data including:
- Cases documented with evidence
- Pattern analysis
- Economic impact assessment
- Geopolitical context
- Legal analysis
- Sources and methodology
- Future outlook

### Article (Markdown)
`content/international-articles/YYYY-MM-DD-slug.md`

Contains the narrative investigation report (2000-3000 words) with frontmatter for publication.

## Investigation Methodology

The agent follows a 5-phase investigation process:

### Phase 1: Case Collection & Pattern Recognition
- Gather multiple cases of interference
- Categorize by type
- Identify patterns and triggers
- Assess scope and timeline

### Phase 2: Evidence Documentation
- Document what happened, who was affected
- Official vs. actual explanations
- Quantify economic impact
- Track international response

### Phase 3: Comparative Analysis
- Cross-country comparisons
- Historical precedent
- Sector-wide impact analysis
- Escalation patterns

### Phase 4: Expert Consultation & Data Analysis
- Trade data analysis (pledges vs. actuals)
- Legal analysis (WTO violations, trade agreement breaches)
- Expert opinions
- Corporate impact assessment

### Phase 5: Investigation Report
- Comprehensive written report
- Data visualizations
- Source documentation
- Future outlook and recommendations

## Investigation Output Schema

```json
{
  "investigation_id": "INTL-2025-001",
  "title": "Investigation Title",
  "region": "Asia/Europe/Americas/Global",
  "countries_involved": ["Country1", "Country2"],
  "investigation_type": "market_interference|trade_dispute|economic_coercion|censorship",
  "cases": [
    {
      "case_id": "CASE-001",
      "date": "2025-11-20",
      "description": "What happened",
      "affected_party": "Who was harmed",
      "official_reason": "Stated justification",
      "actual_motive": "Evidence-based assessment",
      "economic_impact": "Quantified harm",
      "evidence": ["Supporting evidence"],
      "sources": ["Sources"]
    }
  ],
  "pattern_analysis": {
    "commonalities": "Patterns across cases",
    "targeted_sectors": ["Sectors"],
    "targeted_countries": ["Countries"],
    "escalation_timeline": "Evolution over time"
  },
  "economic_impact": {
    "direct_losses": "Quantified costs",
    "market_disruption": "Broader effects",
    "affected_industries": ["Industries"]
  },
  "geopolitical_context": {
    "political_triggers": "Political events",
    "bilateral_tensions": "Relevant disputes",
    "strategic_objectives": "Assessed goals"
  },
  "international_response": {
    "diplomatic_reactions": "Government responses",
    "wto_complaints": "Trade disputes filed",
    "retaliatory_measures": "Counter-actions"
  },
  "legal_analysis": {
    "wto_violations": "Rule breaches",
    "trade_agreement_breaches": "Violations"
  },
  "key_findings": ["Finding 1", "Finding 2"],
  "article": "Full markdown investigation report",
  "sources": ["Source 1", "Source 2"],
  "future_outlook": {
    "escalation_risk": "high|medium|low",
    "business_recommendations": "Strategic advice"
  }
}
```

## Investigation Types

### Pattern Investigations
Collect multiple cases to reveal systematic behavior:
- "China's systematic targeting of Japanese cultural events"
- "Selective enforcement of regulations against Western tech companies"

### Single-Event Deep Dives
Thoroughly investigate one significant case:
- "The cancellation of Ayumi Hamasaki's Shanghai concert"
- "China's domestic AI chip mandate"

### Trend Analysis
Examine how interference evolves over time:
- "Escalation of non-tariff barriers in China 2023-2025"
- "The weaponization of market access for political leverage"

### Comparative Studies
Compare approaches across countries:
- "How China's tech localization compares to India, Russia, and EU"
- "Different models of using trade for geopolitical objectives"

## Key Features

✅ **Evidence-Based**: All claims backed by multiple sources
✅ **Pattern Recognition**: Identifies systematic vs. isolated incidents
✅ **Quantified Impact**: Economic costs and market disruption metrics
✅ **Geopolitical Context**: Links to broader international tensions
✅ **Legal Analysis**: WTO and trade agreement violation assessment
✅ **Future Outlook**: Risk assessment and strategic recommendations

## Ethical Standards

- **Accuracy**: Every claim must be defensible
- **Fairness**: Present official explanations alongside analysis
- **Context**: Explain broader geopolitical/economic context
- **Transparency**: Disclose methodology and limitations
- **Source Protection**: Protect confidential sources who could face retaliation
- **Bias Awareness**: Distinguish legitimate regulation from political interference

## Integration with Main Platform

While this agent operates independently, you can integrate findings:

1. **Canadian Impact Angle**: Filter investigations for Canadian business impact
2. **Cross-Reference**: Link to Canadian journalist agent for domestic angles
3. **Trade Policy**: Use findings to inform Canadian trade policy analysis

## Troubleshooting

**"Could not parse JSON response"**
The agent will save raw output if JSON parsing fails. Review the output file for issues.

**"Investigation too broad"**
Provide more specific context or focus area in the second argument.

**Long execution times**
International investigations can take 2-5 minutes due to comprehensive research requirements.

## Example: Investigating Your Original Request

Based on your initial request about China's market interference, here's how to use this agent:

```bash
npm run intl:investigate -- "China CCP's administrative market interference targeting foreign businesses in 2025" "Focus on these cases: 1) Japanese singer Maki Otsuki cut off mid-performance in Shanghai, 2) Ayumi Hamasaki concert cancellation, 3) Domestic AI chip requirements for state-funded data centers, 4) US-China soybean purchase gaps (pledged 12M tons by end of 2025, only purchased 1M tons by November)"
```

This single command will:
- Investigate all four cases as a pattern
- Analyze common threads (anti-Japanese sentiment, tech protectionism, trade commitment gaps)
- Assess whether this represents systematic interference
- Quantify economic impact across sectors
- Provide geopolitical context
- Deliver comprehensive investigation report

## Further Development

Potential enhancements:
- Add data scraping tools for trade databases
- Integrate with WTO dispute database
- Add visualization generator for trade data
- Create alert system for new interference patterns
- Build comparison database across countries

---

**Need help?** Check the main CLAUDE.md for agent architecture or the prompt.md file for detailed investigation methodology.
