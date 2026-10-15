(function() {
  'use strict';

  // Hook CanvasRenderingContext2D.prototype.fillText to make text readable on dark background
  const originalFillText = CanvasRenderingContext2D.prototype.fillText;
  CanvasRenderingContext2D.prototype.fillText = function(text, x, y, maxWidth) {
    const style = this.fillStyle;
    if (typeof style === 'string') {
      const lower = style.toLowerCase().trim();
      // If color is black or dark gray (typical light-theme text colors)
      if (
        lower === '#666' || 
        lower === '#666666' || 
        lower === '#2e333d' || 
        lower === '#000' || 
        lower === '#000000' || 
        lower === 'black' || 
        lower.startsWith('rgb(102,') || 
        lower.startsWith('rgb(0,') || 
        lower.startsWith('rgb(46,') ||
        lower.startsWith('rgba(0, 0, 0') ||
        lower.startsWith('rgba(0,0,0') ||
        lower.startsWith('rgba(46, 51, 61')
      ) {
        this.fillStyle = '#a3a3a3'; // Dimmed to soft gray for OLED
      }
    }
    return originalFillText.apply(this, arguments);
  };

  // Hook CanvasRenderingContext2D.prototype.stroke to make grid lines subtle light on dark
  const originalStroke = CanvasRenderingContext2D.prototype.stroke;
  CanvasRenderingContext2D.prototype.stroke = function() {
    const strokeStyle = this.strokeStyle;
    if (typeof strokeStyle === 'string') {
      const lower = strokeStyle.toLowerCase().trim();
      if (lower.startsWith('rgba(0, 0, 0') || lower.startsWith('rgba(0,0,0')) {
        this.strokeStyle = 'rgba(255, 255, 255, 0.12)';
      }
    }
    return originalStroke.apply(this, arguments);
  };
})();