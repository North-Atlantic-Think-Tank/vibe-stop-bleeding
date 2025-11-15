# Chart Image Generation Documentation

## Overview

The publishing workflow now automatically converts chart data from article JSON files into PNG images and embeds them in the published markdown files.

## How It Works

### 1. Chart Data in Article JSON

Articles can include chart data in their JSON schema:

```json
{
  "title": "Article Title",
  "content": "Article content...",
  "charts": [
    {
      "type": "line",
      "title": "Chart Title",
      "data": [
        { "name": "Q1 2024", "value": 2.1 },
        { "name": "Q2 2024", "value": 2.3 }
      ],
      "xKey": "name",
      "yKey": "value"
    }
  ]
}
```

### 2. Supported Chart Types

- **line**: Line charts for trends over time
- **bar**: Bar charts for comparisons
- **pie**: Pie charts for proportions
- **area**: Area charts (filled line charts)

### 3. Publishing Process

When you run `npm run workflow:publish -- path/to/article.json`, the system:

1. Reads the article JSON file
2. Generates PNG images for each chart in the `charts` array
3. Saves images to `public/images/charts/`
4. Saves chart data JSON to `public/data/`
5. Embeds image references in the markdown output

### 4. Output Structure

**Chart Images:**
- Location: `public/images/charts/`
- Naming: `{date}-{article-slug}-chart-{number}.png`
- Example: `2025-01-14-canadian-economy-shows-resilience-chart-1.png`

**Chart Data JSON:**
- Location: `public/data/`
- Naming: `{date}-{article-slug}-charts.json`
- Contains the original chart data for reference

**Markdown:**
Charts are automatically embedded in a "Data Visualizations" section:

```markdown
## Data Visualizations

### Chart Title

![Chart Title](/images/charts/2025-01-14-article-slug-chart-1.png)
```

### 5. Customization

**Chart Dimensions:**
- Default: 800x500px
- Modify in `agents/shared/chart-generator.js`

**Color Palette:**
- Uses Canadian-themed colors (red, blue, green, etc.)
- Primary color: Red (#DC2626) inspired by Canadian flag
- Customize in `getColorPalette()` function

**Chart Configuration:**
Each chart type has specific defaults:
- Line charts: Tension 0.3, point radius 5
- Bar charts: Colorful palette per bar
- Pie charts: Legend at bottom

## Usage Examples

### Publishing an Article

```bash
npm run workflow:publish -- content/articles/my-article.json
```

### Using in Data Converter

```javascript
import { jsonToMarkdown } from './agents/shared/data-converter.js';

// Generate charts during conversion
await jsonToMarkdown('article.json', 'article.md', true);
```

## Technical Details

### Dependencies

- `chartjs-node-canvas`: Server-side Chart.js rendering with Canvas
- Automatically generates PNG images from chart configurations

### File Structure

```
agents/
  shared/
    chart-generator.js     # Chart image generation logic
    data-converter.js      # Markdown conversion with chart support
  workflow/
    publish.js             # Publishing workflow

public/
  images/
    charts/                # Generated chart PNG files
  data/                    # Chart JSON data files
```

### Error Handling

- Chart generation errors are logged but don't stop the publishing process
- Articles without charts publish normally
- Invalid chart configurations are caught and reported

## Best Practices

1. **Chart Data Quality**: Ensure data arrays are complete and properly formatted
2. **Descriptive Titles**: Use clear, descriptive chart titles
3. **Data Density**: Keep charts readable (5-10 data points for line/bar, 3-8 for pie)
4. **Testing**: Always preview generated charts before publishing
5. **Accessibility**: Chart images include alt text from titles

## Future Enhancements

Potential improvements:
- Interactive chart option (SVG instead of PNG)
- Custom color schemes per article
- More chart types (scatter, radar, etc.)
- Responsive image sizes
- Dark mode chart variants
