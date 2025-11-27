# Cover Image Generator

Automated article cover image generation using Stability AI API with three distinct artistic styles.

## Overview

The Cover Generator creates professional article cover images in three styles:
- **Moderate**: Professional editorial news illustration with balanced composition
- **Aggressive**: Bold dramatic imagery with strong contrast and vibrant colors
- **Satirical**: Political satire illustration with clever visual metaphors

## Setup

### 1. Environment Variables

Add to your `.env` file:

```bash
STABILITY_API_KEY=your_stability_api_key_here
STABILITY_API_BASE_URL=https://api.stability.ai/v2beta/stable-image/generate/core
```

**Important**: Make sure no shell environment variable is overriding the `.env` file. If you get 405 errors, run `unset STABILITY_API_BASE_URL` before executing the covergen command.

### 2. Image Directory

Cover images are saved to: `public/images/covers/`

This directory will be created automatically if it doesn't exist.

## CLI Usage

### Generate All Three Styles (Default)

```bash
npm run workflow:covergen -- content/articles/2025-11-26-article.json
```

Output:
```
public/images/covers/2025-11-26-article-title-moderate.png
public/images/covers/2025-11-26-article-title-aggressive.png
public/images/covers/2025-11-26-article-title-satirical.png
```

### Generate Single Style

```bash
# Moderate style (professional)
npm run workflow:covergen -- content/articles/2025-11-26-article.json --style=moderate

# Aggressive style (bold)
npm run workflow:covergen -- content/articles/2025-11-26-article.json --style=aggressive

# Satirical style (political satire)
npm run workflow:covergen -- content/articles/2025-11-26-article.json --style=satirical
```

## Programmatic Usage

### Import the Module

```javascript
import {
  generateCoverImage,
  generateAllCoverVariants,
  generateCoverFromArticle
} from './agents/shared/cover-generator.js';
```

### Method 1: From Article JSON File

```javascript
// Generate all three styles
const results = await generateCoverFromArticle('content/articles/article.json');

// Results is an array of 3 objects:
// [
//   { style: 'moderate', path: '...', prompt: '...', styleConfig: {...} },
//   { style: 'aggressive', path: '...', prompt: '...', styleConfig: {...} },
//   { style: 'satirical', path: '...', prompt: '...', styleConfig: {...} }
// ]

// Generate single style
const result = await generateCoverFromArticle(
  'content/articles/article.json',
  false,  // allStyles = false
  'moderate'  // singleStyle
);
```

### Method 2: From Article Data Object

```javascript
const articleData = {
  title: 'Breaking: Canadian Policy Changes',
  summary: 'Analysis of recent policy shifts and their impact...',
  category: 'politics'
};

// Generate single style
const result = await generateCoverImage(articleData, 'aggressive');

// Generate all styles
const results = await generateAllCoverVariants(articleData);
```

### Method 3: Custom Output Directory and Filename

```javascript
const result = await generateCoverImage(
  articleData,
  'moderate',
  '/custom/output/dir',  // outputDir
  'my-custom-filename'   // fileName (without extension)
);
// Output: /custom/output/dir/my-custom-filename-moderate.png
```

## Integration with Existing Workflows

### Example: Add to Editor Write Workflow

```javascript
import { publishArticle } from '../workflow/publish.js';
import { generateCoverFromArticle } from '../shared/cover-generator.js';

async function writeArticle(topic, category) {
  // ... existing article writing code ...

  // Save article JSON
  const outputPath = 'content/articles/article.json';
  await fs.writeFile(outputPath, JSON.stringify(articleData, null, 2));

  // Generate cover images
  console.log('\n🎨 Generating cover images...');
  const coverResults = await generateCoverFromArticle(outputPath);

  // Publish to markdown
  await publishArticle(outputPath);

  return { articleData, coverResults };
}
```

### Example: Add to Commentary Workflow

```javascript
import { writeCommentary } from './commentary.js';
import { generateCoverFromArticle } from '../shared/cover-generator.js';

async function writeCommentaryWithCover(investigationPath) {
  const commentaryData = await writeCommentary(investigationPath);

  // Generate only satirical style for editorial commentary
  const outputPath = 'content/articles/commentary.json';
  const cover = await generateCoverFromArticle(outputPath, false, 'satirical');

  console.log(`✅ Cover image: ${cover.path}`);

  return { commentaryData, cover };
}
```

## Style Details

### Moderate Style
- **Use case**: Standard news articles, factual reporting
- **Visual approach**: Clean, professional, balanced
- **Color palette**: Muted, professional tones
- **Composition**: Straightforward, clear visual hierarchy

### Aggressive Style
- **Use case**: Breaking news, urgent topics, impactful stories
- **Visual approach**: Dynamic, high-contrast, attention-grabbing
- **Color palette**: Vibrant, bold colors
- **Composition**: Dramatic angles, strong focal points

### Satirical Style
- **Use case**: Editorial commentary, opinion pieces, political analysis
- **Visual approach**: Editorial cartoon, visual metaphors
- **Color palette**: Artistic, expressive
- **Composition**: Clever imagery, visual wit

## API Details

### Stability AI Configuration

- **Model**: `sd3-large-turbo` (fast, high-quality generation)
- **Aspect Ratio**: 21:9 (closest to 2:1 supported by Stability AI)
- **Output Format**: PNG
- **API Endpoint**: `https://api.stability.ai/v2beta/stable-image/generate/core` (or `/sd3` or `/ultra`)
- **Authorization**: API key directly (no "Bearer" prefix)

### Prompt Construction

The generator automatically builds prompts from article data:

```
Base: "Editorial news cover image for Canadian news article titled '[TITLE]'. Context: [SUMMARY]. [CATEGORY_CONTEXT]."

+ Style Modifier:
  - Moderate: "Professional editorial news illustration, balanced composition..."
  - Aggressive: "Bold dramatic news illustration, strong contrast..."
  - Satirical: "Political satire illustration, clever visual metaphor..."

+ Negative Prompt (what to avoid):
  - Moderate: "cartoon, caricature, exaggerated, chaotic..."
  - Aggressive: "subtle, muted, soft, gentle..."
  - Satirical: "realistic photo, subtle, corporate..."
```

## Error Handling

The generator includes comprehensive error handling:

```javascript
try {
  const results = await generateAllCoverVariants(articleData);

  // Check for failures
  const successful = results.filter(r => !r.error);
  const failed = results.filter(r => r.error);

  if (failed.length > 0) {
    console.error('Some styles failed:', failed);
  }
} catch (error) {
  console.error('Cover generation error:', error.message);
}
```

## Troubleshooting

### Common Issues

**API Key Error**:
```
Error: STABILITY_API_KEY environment variable is not set
```
**Solution**: Add `STABILITY_API_KEY` to your `.env` file

**API Error (401)**:
```
Stability AI API error (401): Unauthorized
```
**Solution**: Verify your API key is valid and has sufficient credits

**API Error (405 Method Not Allowed)**:
```
Stability AI API error (405): {"message":"Method Not Allowed"}
```
**Solution**: This usually means a shell environment variable is overriding the `.env` file. 
Run `unset STABILITY_API_BASE_URL` and try again. 
Also verify the endpoint URL includes the full path (e.g., `/v2beta/stable-image/generate/core`)

**Invalid Style**:
```
Error: Invalid style: custom. Must be one of: moderate, aggressive, satirical
```
**Solution**: Use only the three supported styles

### Testing

Test the generator with a sample article:

```bash
# Find an existing article
ls content/articles/*.json

# Generate covers
npm run workflow:covergen -- content/articles/[article].json

# Check output
ls public/images/covers/
```

## File Structure

```
agents/
├── shared/
│   ├── cover-generator.js          # Main module
│   └── COVER_GENERATOR_README.md   # This file
├── workflow/
│   └── covergen.js                 # CLI script

public/
└── images/
    └── covers/                     # Output directory
        ├── 2025-11-26-article-moderate.png
        ├── 2025-11-26-article-aggressive.png
        └── 2025-11-26-article-satirical.png
```

## Performance

- **Generation time**: ~5-10 seconds per image
- **Three styles**: ~15-30 seconds total
- **Recommended**: Generate covers after article is finalized to avoid wasted API calls

## Future Enhancements

Potential improvements:
- [ ] Custom aspect ratios (1:1 for social media, 16:9 for headers)
- [ ] Batch processing for multiple articles
- [ ] Caching to avoid regenerating unchanged articles
- [ ] Custom style configurations
- [ ] Integration with image optimization tools
