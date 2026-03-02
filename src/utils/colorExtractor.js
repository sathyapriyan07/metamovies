/**
 * Extract dominant color from an image
 * Lightweight implementation without external dependencies
 */
export const getDominantColor = async (imageUrl) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Use small canvas for performance
        canvas.width = 100;
        canvas.height = 100;
        
        ctx.drawImage(img, 0, 0, 100, 100);
        const imageData = ctx.getImageData(0, 0, 100, 100).data;
        
        // Sample colors and find dominant
        const colorMap = {};
        let maxCount = 0;
        let dominantColor = [229, 9, 20]; // Default Netflix red
        
        for (let i = 0; i < imageData.length; i += 4 * 10) { // Sample every 10th pixel
          const r = Math.round(imageData[i] / 10) * 10;
          const g = Math.round(imageData[i + 1] / 10) * 10;
          const b = Math.round(imageData[i + 2] / 10) * 10;
          
          // Skip very dark or very light colors
          const brightness = (r * 299 + g * 587 + b * 114) / 1000;
          if (brightness < 30 || brightness > 220) continue;
          
          const key = `${r},${g},${b}`;
          colorMap[key] = (colorMap[key] || 0) + 1;
          
          if (colorMap[key] > maxCount) {
            maxCount = colorMap[key];
            dominantColor = [r, g, b];
          }
        }
        
        resolve(`rgb(${dominantColor[0]}, ${dominantColor[1]}, ${dominantColor[2]})`);
      } catch (error) {
        // Fallback to default color on error
        resolve('rgb(229, 9, 20)');
      }
    };
    
    img.onerror = () => {
      resolve('rgb(229, 9, 20)');
    };
    
    // Add cache buster for CORS
    img.src = imageUrl.includes('?') ? `${imageUrl}&t=${Date.now()}` : `${imageUrl}?t=${Date.now()}`;
  });
};

/**
 * Check if color is dark (for text contrast)
 */
export const isDarkColor = (rgbString) => {
  const match = rgbString.match(/\d+/g);
  if (!match) return true;
  
  const [r, g, b] = match.map(Number);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness < 128;
};

/**
 * Adjust color brightness
 */
export const adjustBrightness = (rgbString, factor = 0.8) => {
  const match = rgbString.match(/\d+/g);
  if (!match) return rgbString;
  
  const [r, g, b] = match.map(Number);
  return `rgb(${Math.round(r * factor)}, ${Math.round(g * factor)}, ${Math.round(b * factor)})`;
};
