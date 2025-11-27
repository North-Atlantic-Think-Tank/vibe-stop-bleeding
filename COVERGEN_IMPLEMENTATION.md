# Cover Image Generator - Implementation Summary

## What Was Created

A complete cover image generation workflow using Stability AI that generates three artistic style variations (moderate, aggressive, satirical) for article cover images.

## Files Created

### 1. Core Module: `agents/shared/cover-generator.js`
The main module with three exported functions:
- `generateCoverImage(articleData, style, outputDir, fileName)` - Generate single style
- `generateAllCoverVariants(articleData, outputDir, fileName)` - Generate all 3 styles
- `generateCoverFromArticle(jsonPath, allStyles, singleStyle)` - Generate from JSON file

### 2. CLI Workflow: `agents/workflow/covergen.js`
Standalone command-line script for generating covers with flexible options.

### 3. Documentation
- `agents/shared/COVER_GENERATOR_README.md` - Comprehensive usage guide
- Updated `CLAUDE.md` - Added covergen section and integration examples
- Updated `.env.example` - Added Stability AI configuration

### 4. Configuration
- Updated `package.json` - Added `workflow:covergen` npm script

## Features Implemented

✅ **Three Artistic Styles**:
- **Moderate**: Professional editorial news illustration
- **Aggressive**: Bold dramatic imagery with high contrast
- **Satirical**: Political satire with clever visual metaphors

✅ **Flexible Generation**:
- Generate all three styles at once (default)
- Generate single specific style
- Automatic prompt construction from article data
- Category-aware prompts (politics, economy, employment, education)

✅ **Aspect Ratio**: 21:9 (closest to 2:1 supported by Stability AI)

✅ **Smart File Naming**: `YYYY-MM-DD-article-slug-[style].png`

✅ **Error Handling**: Comprehensive error messages and validation

✅ **Directory Management**: Auto-creates `public/images/covers/` if needed

## Quick Start

### 1. Setup Environment Variables

Add to your `.env` file (already configured in .env.example):

```bash
STABILITY_API_KEY=your_stability_api_key_here
STABILITY_API_BASE_URL=https://api.stability.ai/v2beta/stable-image/generate/sd3
```

### 2. Usage Examples

```bash
# Generate all three styles for an article
npm run workflow:covergen -- content/articles/2025-11-13-education-funding.json

# Generate only moderate style
npm run workflow:covergen -- content/articles/2025-11-13-education-funding.json --style=moderate

# Generate only aggressive style
npm run workflow:covergen -- content/articles/2025-11-13-education-funding.json --style=aggressive

# Generate only satirical style
npm run workflow:covergen -- content/articles/2025-11-13-education-funding.json --style=satirical
```

## Integration with Existing Workflows

### Option 1: Add to Editor Write Workflow

```javascript
// In agents/editor/write.js
import { generateCoverFromArticle } from '../shared/cover-generator.js';

async function writeArticle(topic, category) {
  // ... existing article writing code ...

  // Save article JSON
  await fs.writeFile(outputPath, JSON.stringify(articleData, null, 2));

  // Generate cover images (optional, can be skipped if API key not set)
  try {
    console.log('\n🎨 Generating cover images...');
    await generateCoverFromArticle(outputPath);
  } catch (error) {
    console.warn('⚠️  Cover generation skipped:', error.message);
  }

  // Publish to markdown
  await publishArticle(outputPath);
}
```

### Option 2: Add to Commentary Workflow

```javascript
// In agents/workflow/commentary.js
import { generateCoverFromArticle } from '../shared/cover-generator.js';

async function writeCommentary(investigationJsonPath) {
  // ... existing commentary writing code ...

  await fs.writeFile(outputPath, JSON.stringify(commentaryData, null, 2));

  // Generate satirical style cover for editorials
  try {
    await generateCoverFromArticle(outputPath, false, 'satirical');
  } catch (error) {
    console.warn('⚠️  Cover generation skipped:', error.message);
  }
}
```

### Option 3: Add to Daily Workflow

```javascript
// In agents/workflow/daily-cycle.js
import { generateCoverFromArticle } from '../shared/cover-generator.js';

async function dailyCycle() {
  // ... research and write article ...

  // Generate covers as part of daily workflow
  if (process.env.STABILITY_API_KEY) {
    console.log('\n🎨 Generating cover images...');
    await generateCoverFromArticle(articlePath);
  }
}
```

## Testing

Test with existing articles:

```bash
# Test with education funding article
npm run workflow:covergen -- content/articles/2025-11-13-education-funding.json

# Test with economy article
npm run workflow:covergen -- content/articles/2025-11-14-sample-canadian-economy.json

# Check generated images
ls -lh public/images/covers/
```

Expected output location:
```
public/images/covers/
├── 2025-11-13-education-funding-moderate.png
├── 2025-11-13-education-funding-aggressive.png
└── 2025-11-13-education-funding-satirical.png
```

## API Configuration

### Stability AI Settings
- **Model**: `sd3-large-turbo` (fast generation, ~5-10s per image)
- **Aspect Ratio**: 21:9 (approximately 2:1 as requested)
- **Output Format**: PNG
- **Size**: Optimized for web usage

### Cost Considerations
- Each image generation costs credits from your Stability AI account
- Recommended: Generate covers after article is finalized
- Optional: Add API key check before generation to avoid unnecessary costs

## Style Guide

### When to Use Each Style

**Moderate Style**:
- General news articles
- Factual reporting
- Economic data analysis
- Educational content

**Aggressive Style**:
- Breaking news
- Urgent policy changes
- Major economic shifts
- High-impact stories

**Satirical Style**:
- Editorial commentary
- Opinion pieces
- Political analysis
- Controversial topics

## Programmatic Usage

For custom integrations:

```javascript
import { generateCoverImage, generateAllCoverVariants } from './agents/shared/cover-generator.js';

// From article data object
const articleData = {
  title: 'Breaking News: Policy Change',
  summary: 'Analysis of recent developments...',
  category: 'politics'
};

// Single style
const result = await generateCoverImage(articleData, 'aggressive');
console.log('Generated:', result.path);

// All styles
const results = await generateAllCoverVariants(articleData);
results.forEach(r => console.log(`${r.style}: ${r.path}`));
```

## Troubleshooting

### Common Issues

**Missing API Key**:
```
Error: STABILITY_API_KEY environment variable is not set
```
→ Add `STABILITY_API_KEY` to `.env`

**Invalid Article Path**:
```
Error: Article file not found: path/to/article.json
```
→ Verify the JSON file exists and path is correct

**API Errors**:
```
Stability AI API error (401): Unauthorized
```
→ Check API key validity and account credits

## Next Steps

1. **Set up environment variables** in `.env`
2. **Test with existing articles** using the CLI
3. **Integrate into workflows** based on your needs
4. **Review generated images** and choose preferred style per article
5. **Update website** to display cover images

## Architecture Benefits

✅ **Modular Design**: Shared utility can be imported anywhere
✅ **Flexible CLI**: Standalone script for manual use
✅ **Easy Integration**: Simple function calls for workflow integration
✅ **Error Tolerant**: Failures don't break article publishing
✅ **Well Documented**: Comprehensive README and examples

## Future Enhancements

Potential improvements (not implemented):
- [ ] Custom aspect ratios for social media (1:1, 16:9)
- [ ] Batch processing for multiple articles
- [ ] Image caching to avoid regeneration
- [ ] Custom style configurations
- [ ] Integration with website frontmatter
- [ ] Automatic cover selection based on category

---

**Implementation Complete!** 🎉

The covergen workflow is ready to use. Test it with an existing article:

```bash
npm run workflow:covergen -- content/articles/2025-11-13-education-funding.json
```
