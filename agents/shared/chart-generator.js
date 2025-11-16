import { ChartJSNodeCanvas } from 'chartjs-node-canvas';
import fs from 'fs/promises';
import path from 'path';

/**
 * Chart Image Generator
 * Converts chart data from JSON to PNG images using Chart.js
 */

const width = 800;
const height = 500;
const backgroundColour = 'white';

const chartJSNodeCanvas = new ChartJSNodeCanvas({
  width,
  height,
  backgroundColour,
});

/**
 * Generates color palette for charts
 */
function getColorPalette(count) {
  const colors = [
    'rgba(220, 38, 38, 0.8)',   // Red (Canadian flag inspired)
    'rgba(37, 99, 235, 0.8)',   // Blue
    'rgba(34, 197, 94, 0.8)',   // Green
    'rgba(234, 179, 8, 0.8)',   // Yellow
    'rgba(168, 85, 247, 0.8)',  // Purple
    'rgba(236, 72, 153, 0.8)',  // Pink
    'rgba(20, 184, 166, 0.8)',  // Teal
    'rgba(249, 115, 22, 0.8)',  // Orange
  ];

  return colors.slice(0, count);
}

/**
 * Configure chart based on type and data
 * Supports two data formats:
 * 1. Chart.js format: { labels: [...], datasets: [...] }
 * 2. Array format: [{ xKey: value, yKey: value }, ...] with xKey/yKey specified
 */
function createChartConfig(chartData) {
  const { type, title, data, xKey, yKey } = chartData;

  const baseConfig = {
    type: type === 'area' ? 'line' : type,
    data: {
      labels: [],
      datasets: [],
    },
    options: {
      responsive: false,
      plugins: {
        title: {
          display: true,
          text: title,
          font: {
            size: 18,
            weight: 'bold',
          },
          padding: 20,
        },
        legend: {
          display: type === 'pie' || (data.datasets && data.datasets.length > 1),
          position: 'bottom',
        },
      },
      scales: {},
    },
  };

  // Check if data is already in Chart.js format (has labels and datasets)
  const isChartJsFormat = data && data.labels && data.datasets;

  if (isChartJsFormat) {
    // Data is already in Chart.js format, use it directly with styling
    baseConfig.data.labels = data.labels;

    // Apply default styling to datasets
    baseConfig.data.datasets = data.datasets.map((dataset, idx) => {
      const colors = getColorPalette(data.datasets.length);
      const baseDataset = {
        ...dataset,
        borderColor: dataset.borderColor || colors[idx].replace('0.8', '1'),
        backgroundColor: dataset.backgroundColor || colors[idx],
      };

      // Add chart-type specific styling
      if (type === 'line' || type === 'area') {
        baseDataset.tension = dataset.tension || 0.3;
        baseDataset.pointRadius = dataset.pointRadius || 5;
        baseDataset.pointHoverRadius = dataset.pointHoverRadius || 7;
        baseDataset.fill = type === 'area' ? true : (dataset.fill || false);
      } else if (type === 'bar') {
        baseDataset.borderWidth = dataset.borderWidth || 2;
      }

      return baseDataset;
    });

    // Configure scales for non-pie charts
    if (type !== 'pie') {
      baseConfig.options.scales = {
        y: {
          beginAtZero: true,
          ticks: {
            font: { size: 12 },
          },
        },
        x: {
          ticks: {
            font: { size: 12 },
          },
        },
      };
    } else {
      delete baseConfig.options.scales;
      baseConfig.options.plugins.legend.display = true;
    }
  } else {
    // Original array format with xKey/yKey
    // Configure based on chart type
    switch (type) {
      case 'line':
      case 'area': {
        baseConfig.data.labels = data.map(d => d[xKey]);
        baseConfig.data.datasets = [{
          label: title,
          data: data.map(d => d[yKey]),
          borderColor: 'rgba(220, 38, 38, 1)',
          backgroundColor: type === 'area' ? 'rgba(220, 38, 38, 0.2)' : 'rgba(220, 38, 38, 0.8)',
          fill: type === 'area',
          tension: 0.3,
          pointRadius: 5,
          pointHoverRadius: 7,
        }];

        baseConfig.options.scales = {
          y: {
            beginAtZero: true,
            ticks: {
              font: { size: 12 },
            },
          },
          x: {
            ticks: {
              font: { size: 12 },
            },
          },
        };
        break;
      }

      case 'bar': {
        baseConfig.data.labels = data.map(d => d[xKey]);
        baseConfig.data.datasets = [{
          label: title,
          data: data.map(d => d[yKey]),
          backgroundColor: getColorPalette(data.length),
          borderColor: getColorPalette(data.length).map(c => c.replace('0.8', '1')),
          borderWidth: 2,
        }];

        baseConfig.options.scales = {
          y: {
            beginAtZero: true,
            ticks: {
              font: { size: 12 },
            },
          },
          x: {
            ticks: {
              font: { size: 12 },
            },
          },
        };
        break;
      }

      case 'pie': {
        baseConfig.data.labels = data.map(d => d[xKey]);
        baseConfig.data.datasets = [{
          data: data.map(d => d[yKey]),
          backgroundColor: getColorPalette(data.length),
          borderColor: '#ffffff',
          borderWidth: 2,
        }];

        // Remove scales for pie charts
        delete baseConfig.options.scales;
        baseConfig.options.plugins.legend.display = true;
        break;
      }

      default:
        throw new Error(`Unsupported chart type: ${type}`);
    }
  }

  return baseConfig;
}

/**
 * Check if a chart type is supported for image generation
 * @param {string} type - Chart type
 * @returns {boolean} True if supported
 */
function isChartTypeSupported(type) {
  const supportedTypes = ['line', 'area', 'bar', 'pie'];
  return supportedTypes.includes(type);
}

/**
 * Generate chart image from chart data
 * @param {Object} chartData - Chart configuration object
 * @param {string} outputPath - Path to save the PNG image
 * @returns {Promise<string|null>} Path to generated image, or null if chart type is not supported
 */
export async function generateChartImage(chartData, outputPath) {
  try {
    // Skip non-chartable types like info-box, table, etc.
    if (!isChartTypeSupported(chartData.type)) {
      console.log(`⏭️  Skipping non-chartable type: ${chartData.type}`);
      return null;
    }

    const config = createChartConfig(chartData);
    const imageBuffer = await chartJSNodeCanvas.renderToBuffer(config);

    // Ensure directory exists
    await fs.mkdir(path.dirname(outputPath), { recursive: true });

    // Write image file
    await fs.writeFile(outputPath, imageBuffer);

    console.log(`📊 Generated chart image: ${outputPath}`);
    return outputPath;
  } catch (error) {
    console.error(`Error generating chart image: ${error.message}`);
    throw error;
  }
}

/**
 * Generate multiple chart images from an array of chart data
 * @param {Array} charts - Array of chart data objects
 * @param {string} baseOutputPath - Base path for output (without extension)
 * @returns {Promise<Array>} Array of generated image paths (excludes skipped charts)
 */
export async function generateChartImages(charts, baseOutputPath) {
  const imagePaths = [];
  let chartIndex = 1;

  for (let i = 0; i < charts.length; i++) {
    const chart = charts[i];
    const outputPath = `${baseOutputPath}-chart-${chartIndex}.png`;
    const result = await generateChartImage(chart, outputPath);

    // Only add to paths and increment index if chart was actually generated
    if (result !== null) {
      imagePaths.push(outputPath);
      chartIndex++;
    }
  }

  return imagePaths;
}

export default {
  generateChartImage,
  generateChartImages,
};
