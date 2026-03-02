/**
 * Extract 3-color palette from an image
 * Lightweight implementation without external dependencies
 */
export const getColorPalette = async (imageUrl) => {
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
        
        // Collect color samples
        const colors = [];
        for (let i = 0; i < imageData.length; i += 4 * 20) { // Sample every 20th pixel
          const r = imageData[i];
          const g = imageData[i + 1];
          const b = imageData[i + 2];
          
          // Skip very dark or very light colors
          const brightness = (r * 299 + g * 587 + b * 114) / 1000;
          if (brightness < 30 || brightness > 220) continue;
          
          colors.push([r, g, b]);
        }
        
        if (colors.length < 3) {
          // Fallback palette
          resolve([
            'rgb(229, 9, 20)',
            'rgb(139, 0, 0)',
            'rgb(50, 50, 50)'
          ]);
          return;
        }
        
        // K-means clustering to find 3 dominant colors
        const palette = kMeansClustering(colors, 3);
        
        resolve(palette.map(c => `rgb(${Math.round(c[0])}, ${Math.round(c[1])}, ${Math.round(c[2])})`));
      } catch (error) {
        // Fallback palette
        resolve([
          'rgb(229, 9, 20)',
          'rgb(139, 0, 0)',
          'rgb(50, 50, 50)'
        ]);
      }
    };
    
    img.onerror = () => {
      resolve([
        'rgb(229, 9, 20)',
        'rgb(139, 0, 0)',
        'rgb(50, 50, 50)'
      ]);
    };
    
    // Add cache buster for CORS
    img.src = imageUrl.includes('?') ? `${imageUrl}&t=${Date.now()}` : `${imageUrl}?t=${Date.now()}`;
  });
};

/**
 * Simple K-means clustering for color palette extraction
 */
const kMeansClustering = (colors, k) => {
  // Initialize centroids randomly
  let centroids = [];
  for (let i = 0; i < k; i++) {
    centroids.push(colors[Math.floor(Math.random() * colors.length)]);
  }
  
  // Run k-means for 5 iterations (balance between accuracy and performance)
  for (let iter = 0; iter < 5; iter++) {
    const clusters = Array(k).fill(null).map(() => []);
    
    // Assign colors to nearest centroid
    colors.forEach(color => {
      let minDist = Infinity;
      let clusterIndex = 0;
      
      centroids.forEach((centroid, i) => {
        const dist = Math.sqrt(
          Math.pow(color[0] - centroid[0], 2) +
          Math.pow(color[1] - centroid[1], 2) +
          Math.pow(color[2] - centroid[2], 2)
        );
        
        if (dist < minDist) {
          minDist = dist;
          clusterIndex = i;
        }
      });
      
      clusters[clusterIndex].push(color);
    });
    
    // Update centroids
    centroids = clusters.map(cluster => {
      if (cluster.length === 0) return centroids[0]; // Fallback
      
      const sum = cluster.reduce((acc, color) => [
        acc[0] + color[0],
        acc[1] + color[1],
        acc[2] + color[2]
      ], [0, 0, 0]);
      
      return [
        sum[0] / cluster.length,
        sum[1] / cluster.length,
        sum[2] / cluster.length
      ];
    });
  }
  
  return centroids;
};

/**
 * Extract dominant color from an image (single color)
 */
export const getDominantColor = async (imageUrl) => {
  const palette = await getColorPalette(imageUrl);
  return palette[0];
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
