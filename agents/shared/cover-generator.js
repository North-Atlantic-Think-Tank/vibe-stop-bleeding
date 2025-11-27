import 'dotenv/config';

import fs from 'fs/promises';
import path from 'path';

/**
 * Cover Image Generator
 * Generates article cover images using Stability AI API
 * Supports three artistic styles: moderate, aggressive, satirical
 */

const imageFormat = 'jpeg';

/**
 * Style configurations for different artistic approaches
 */
const STYLE_CONFIGS = {
  moderate: {
    name: 'Moderate',
    suffix: 'moderate',
    promptModifier:
      'Professional editorial news illustration, balanced composition, clean modern design, photorealistic with subtle artistic elements, muted color palette, Canadian context',
    negativePrompt: 'cartoon, caricature, exaggerated, chaotic, distorted',
  },
  aggressive: {
    name: 'Aggressive',
    suffix: 'aggressive',
    promptModifier:
      'Bold dramatic news illustration, strong contrast, dynamic composition, impactful visual metaphors, vibrant colors, powerful imagery, Canadian context, editorial impact',
    negativePrompt: 'subtle, muted, soft, gentle, pastel',
  },
  satirical: {
    name: 'Satirical',
    suffix: 'satirical',
    promptModifier:
      'Political satire illustration, clever visual metaphor, editorial cartoon style, witty visual commentary, Canadian political context, intelligent humor, artistic exaggeration',
    negativePrompt: 'realistic photo, subtle, corporate, bland',
  },
};

/**
 * Build image generation prompt from article data
 * @param {Object} articleData - Article data with title, summary, category, etc.
 * @param {string} style - Style variant: 'moderate', 'aggressive', or 'satirical'
 * @returns {string} Formatted prompt for image generation
 */
function buildPrompt(articleData, style = 'moderate') {
  const styleConfig = STYLE_CONFIGS[style];
  const title = articleData.title || 'Untitled';
  const summary = articleData.summary || '';
  const category = articleData.category || 'general';

  // Build base prompt from article context
  let basePrompt = `Editorial news cover image for Canadian news article titled "${title}".`;

  // Add summary context if available
  if (summary) {
    basePrompt += ` Context: ${summary.substring(0, 200)}`;
  }

  // Add category-specific context
  const categoryContext = {
    politics: 'Political theme, Parliament Hill, government context',
    economy: 'Economic theme, financial imagery, business context',
    employment: 'Workplace theme, labor market, employment context',
    education: 'Education theme, academic context, learning environment',
    general: 'Canadian news context, broad appeal',
  };

  basePrompt += `. ${categoryContext[category] || categoryContext.general}.`;

  // Combine with style modifier
  const fullPrompt = `${basePrompt} ${styleConfig.promptModifier}`;

  return fullPrompt;
}

/**
 * Generate cover image using Stability AI API
 * @param {string} prompt - Image generation prompt
 * @param {string} negativePrompt - Negative prompt (what to avoid)
 * @param {string} outputPath - Path to save the generated image
 * @returns {Promise<string>} Path to generated image
 */
async function generateImageFromAPI(prompt, negativePrompt, outputPath) {
  const STABILITY_API_KEY = process.env.STABILITY_API_KEY;
  const STABILITY_API_BASE_URL =
    process.env.STABILITY_API_BASE_URL ||
    'https://api.stability.ai/v2beta/stable-image/generate/core';

  if (!STABILITY_API_KEY) {
    throw new Error('STABILITY_API_KEY environment variable is not set');
  }

  try {
    const formData = new FormData();
    formData.append('prompt', prompt);
    formData.append('negative_prompt', negativePrompt);
    formData.append('output_format', imageFormat);

    // Set aspect ratio to 2:1 (width:height)
    // Using 1024x512 for good quality at 2:1 ratio
    formData.append('aspect_ratio', '21:9'); // Closest to 2:1 in Stability AI
    formData.append('model', 'sd3-large-turbo');

    const response = await fetch(STABILITY_API_BASE_URL, {
      method: 'POST',
      headers: {
        Authorization: STABILITY_API_KEY,
        Accept: 'image/*',
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Stability AI API error (${response.status}): ${errorText}`,
      );
    }

    // Get image buffer
    const imageBuffer = Buffer.from(await response.arrayBuffer());

    // Ensure directory exists
    await fs.mkdir(path.dirname(outputPath), { recursive: true });

    // Write image file
    await fs.writeFile(outputPath, imageBuffer);

    console.log(`🎨 Generated image: ${outputPath}`);
    return outputPath;
  } catch (error) {
    console.error(`Error generating image: ${error.message}`);
    throw error;
  }
}

/**
 * Generate cover image for an article in a specific style
 * @param {Object} articleData - Article data (title, summary, category, etc.)
 * @param {string} style - Style variant: 'moderate', 'aggressive', or 'satirical'
 * @param {string} outputDir - Directory to save images (default: public/images/covers)
 * @param {string} fileName - Base filename without extension (optional, auto-generated from title)
 * @returns {Promise<Object>} Object with style, path, and prompt used
 */
export async function generateCoverImage(
  articleData,
  style = 'moderate',
  outputDir = null,
  fileName = null,
) {
  const styleConfig = STYLE_CONFIGS[style];

  if (!styleConfig) {
    throw new Error(
      `Invalid style: ${style}. Must be one of: moderate, aggressive, satirical`,
    );
  }

  // Generate filename from title if not provided
  if (!fileName) {
    const title = articleData.title || 'untitled';
    fileName = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .substring(0, 50);
  }

  // Set default output directory
  if (!outputDir) {
    outputDir = path.join(process.cwd(), 'public/images/covers');
  }

  const outputPath = path.join(
    outputDir,
    `${fileName}-${styleConfig.suffix}.${imageFormat}`,
  );
  const prompt = buildPrompt(articleData, style);

  console.log(`\n🎨 Generating ${styleConfig.name} style cover image...`);
  console.log(`📝 Prompt: ${prompt.substring(0, 100)}...`);

  const imagePath = await generateImageFromAPI(
    prompt,
    styleConfig.negativePrompt,
    outputPath,
  );

  return {
    style,
    path: imagePath,
    prompt,
    styleConfig,
  };
}

/**
 * Generate all three style variants for an article
 * @param {Object} articleData - Article data (title, summary, category, etc.)
 * @param {string} outputDir - Directory to save images (default: public/images/covers)
 * @param {string} fileName - Base filename without extension (optional, auto-generated from title)
 * @returns {Promise<Array>} Array of objects with style, path, and prompt for each variant
 */
export async function generateAllCoverVariants(
  articleData,
  outputDir = null,
  fileName = null,
) {
  console.log('\n🎨 Cover Image Generation - All Styles');
  console.log('='.repeat(60));
  console.log(`📄 Article: "${articleData.title || 'Untitled'}"`);
  console.log(`📂 Category: ${articleData.category || 'general'}`);

  const styles = ['moderate', 'aggressive', 'satirical'];
  const results = [];

  for (const style of styles) {
    try {
      const result = await generateCoverImage(
        articleData,
        style,
        outputDir,
        fileName,
      );
      results.push(result);
      console.log(`✅ ${STYLE_CONFIGS[style].name} style complete`);
    } catch (error) {
      console.error(`❌ Failed to generate ${style} style: ${error.message}`);
      results.push({
        style,
        error: error.message,
      });
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log(
    `✅ Generated ${results.filter((r) => !r.error).length}/3 cover variants\n`,
  );

  return results;
}

/**
 * Generate cover images from article JSON file
 * Convenience function for workflow integration
 * @param {string} articleJsonPath - Path to article JSON file
 * @param {boolean} allStyles - Generate all three styles (default: true)
 * @param {string} singleStyle - Generate only one style (optional: 'moderate', 'aggressive', 'satirical')
 * @returns {Promise<Array|Object>} Array of results if allStyles=true, single result if singleStyle specified
 */
export async function generateCoverFromArticle(
  articleJsonPath,
  allStyles = true,
  singleStyle = null,
) {
  // Read article JSON
  const articleData = JSON.parse(await fs.readFile(articleJsonPath, 'utf-8'));

  // Extract date and slug from article for filename
  const date = articleData.date || new Date().toISOString().split('T')[0];
  const slug = (articleData.title || 'untitled')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .substring(0, 30);
  const fileName = `${date}-${slug}`;

  if (singleStyle) {
    return await generateCoverImage(articleData, singleStyle, null, fileName);
  } else if (allStyles) {
    return await generateAllCoverVariants(articleData, null, fileName);
  } else {
    // Default to moderate style
    return await generateCoverImage(articleData, 'moderate', null, fileName);
  }
}

export default {
  generateCoverImage,
  generateAllCoverVariants,
  generateCoverFromArticle,
  STYLE_CONFIGS,
};
