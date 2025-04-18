const fs = require('fs');
const path = require('path');

// Helper function to create a simple SVG icon
function createIconSVG(size) {
  // This creates a simple lock icon with the size parameter
  const padding = Math.floor(size * 0.2); // 20% padding
  const iconSize = size - (2 * padding); // Icon size with padding
  const strokeWidth = Math.max(Math.floor(size * 0.03), 2); // Stroke width proportional to icon size

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}px" height="${size}px" viewBox="0 0 ${size} ${size}" version="1.1" xmlns="http://www.w3.org/2000/svg">
    <title>E2E Encryption Icon</title>
    <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <rect fill="#0070F3" x="0" y="0" width="${size}" height="${size}"></rect>
        <g transform="translate(${padding}, ${padding})" stroke="#FFFFFF" stroke-width="${strokeWidth}">
            <rect x="${strokeWidth/2}" y="${iconSize*0.4}" width="${iconSize-strokeWidth}" height="${iconSize*0.6-strokeWidth}" rx="${iconSize*0.05}"></rect>
            <path d="M${iconSize*0.25},${iconSize*0.4} L${iconSize*0.25},${iconSize*0.25} C${iconSize*0.25},${iconSize*0.11} ${iconSize*0.36},${iconSize*0.0} ${iconSize*0.5},${iconSize*0.0} C${iconSize*0.64},${iconSize*0.0} ${iconSize*0.75},${iconSize*0.11} ${iconSize*0.75},${iconSize*0.25} L${iconSize*0.75},${iconSize*0.4}"></path>
            <circle cx="${iconSize*0.5}" cy="${iconSize*0.65}" r="${iconSize*0.1}"></circle>
            <line x1="${iconSize*0.5}" y1="${iconSize*0.75}" x2="${iconSize*0.5}" y2="${iconSize*0.85}"></line>
        </g>
    </g>
</svg>`;
}

// Create icons directory if it doesn't exist
const iconsDir = path.join(__dirname, '../public/icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Generate both icon sizes
const sizes = [192, 512];
sizes.forEach(size => {
  const iconSvg = createIconSVG(size);
  const filePath = path.join(iconsDir, `icon-${size}x${size}.svg`);
  fs.writeFileSync(filePath, iconSvg);
  console.log(`Generated icon: ${filePath}`);
});

// Generate favicon.ico with smaller size
const faviconSvg = createIconSVG(32);
const faviconPath = path.join(__dirname, '../public/favicon.ico');
fs.writeFileSync(faviconPath, faviconSvg);
console.log(`Generated favicon: ${faviconPath}`);

console.log('Icon generation complete!');