// Default stylized partner signature rendered as a high-res PNG data URL.
export const getDefaultSignatureDataUrl = (): string => {
  if (typeof document === 'undefined') return '';
  
  const canvas = document.createElement('canvas');
  canvas.width = 400;
  canvas.height = 180;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Clear with transparent background
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Match the supplied handwritten mark: saturated blue ink with a rounded pen.
  ctx.strokeStyle = '#1717a8';
  ctx.fillStyle = '#1717a8';
  ctx.lineWidth = 5.5;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // Tall loop and descending stroke.
  ctx.beginPath();
  ctx.moveTo(126, 132);
  ctx.bezierCurveTo(112, 120, 115, 108, 125, 91);
  ctx.bezierCurveTo(151, 48, 166, 12, 193, 11);
  ctx.bezierCurveTo(218, 10, 225, 39, 216, 72);
  ctx.bezierCurveTo(207, 105, 187, 124, 164, 143);

  // Return stroke through the loop and the lower-left hook.
  ctx.moveTo(166, 143);
  ctx.bezierCurveTo(142, 159, 112, 168, 102, 158);
  ctx.bezierCurveTo(94, 150, 111, 126, 126, 103);
  ctx.bezierCurveTo(145, 74, 155, 48, 160, 22);
  ctx.bezierCurveTo(164, 8, 177, 4, 190, 8);

  // Long rising baseline flourish.
  ctx.moveTo(104, 158);
  ctx.bezierCurveTo(145, 151, 204, 127, 263, 94);
  ctx.bezierCurveTo(291, 79, 316, 65, 339, 52);

  // Small detached dash at the right.
  ctx.moveTo(312, 113);
  ctx.bezierCurveTo(323, 114, 334, 113, 342, 112);

  ctx.stroke();

  return canvas.toDataURL('image/png');
};
