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
          display: type === 'pie',
          position: 'bottom',
        },
      },
      scales: {},
    },
  };

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

  return baseConfig;
}

/**
 * Generate chart image from chart data
 * @param {Object} chartData - Chart configuration object
 * @param {string} outputPath - Path to save the PNG image
 * @returns {Promise<string>} Path to generated image
 */
export async function generateChartImage(chartData, outputPath) {
  try {
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
 * @returns {Promise<Array>} Array of generated image paths
 */
export async function generateChartImages(charts, baseOutputPath) {
  const imagePaths = [];

  for (let i = 0; i < charts.length; i++) {
    const chart = charts[i];
    const outputPath = `${baseOutputPath}-chart-${i + 1}.png`;
    await generateChartImage(chart, outputPath);
    imagePaths.push(outputPath);
  }

  return imagePaths;
}

export default {
  generateChartImage,
  generateChartImages,
};
