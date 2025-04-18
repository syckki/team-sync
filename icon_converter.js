const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');

async function convertSvgToPng(svgPath, pngPath, size) {
  try {
    // Create a canvas of the desired size
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');
    
    // Load the SVG file content
    const svgContent = fs.readFileSync(svgPath, 'utf8');
    
    // Create a data URL from the SVG content
    const svgDataUrl = `data:image/svg+xml;base64,${Buffer.from(svgContent).toString('base64')}`;
    
    // Load the SVG image
    const img = await loadImage(svgDataUrl);
    
    // Draw the image on the canvas
    ctx.drawImage(img, 0, 0, size, size);
    
    // Save the canvas as a PNG file
    const out = fs.createWriteStream(pngPath);
    const stream = canvas.createPNGStream();
    stream.pipe(out);
    
    return new Promise((resolve, reject) => {
      out.on('finish', () => {
        console.log(`Created ${pngPath}`);
        resolve();
      });
      out.on('error', reject);
    });
  } catch (error) {
    console.error("Error converting SVG to PNG:", error);
    throw error;
  }
}

(async () => {
  try {
    // Convert to 192x192 and 512x512 PNG files
    await convertSvgToPng('public/icons/icon-512x512.svg', 'public/icons/icon-192x192.png', 192);
    await convertSvgToPng('public/icons/icon-512x512.svg', 'public/icons/icon-512x512.png', 512);
    console.log('Conversion complete!');
  } catch (error) {
    console.error('Failed to convert icons:', error);
  }
})();
