// Default stylized partner signature for R.S.N. Murthy rendered as high-res PNG data URL
export const getDefaultSignatureDataUrl = (): string => {
  if (typeof document === 'undefined') return '';
  
  const canvas = document.createElement('canvas');
  canvas.width = 400;
  canvas.height = 120;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Clear with transparent background
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Set signature ink style (deep blue ink)
  ctx.strokeStyle = '#1e3a8a'; // Deep royal blue ink
  ctx.lineWidth = 2.8;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // Draw authentic stylized cursive signature for R.S.N. Murthy
  ctx.beginPath();
  
  // 'R' loop & flourishing downstroke
  ctx.moveTo(40, 75);
  ctx.bezierCurveTo(42, 35, 60, 20, 78, 24);
  ctx.bezierCurveTo(94, 28, 96, 50, 78, 56);
  ctx.bezierCurveTo(60, 60, 50, 60, 48, 86);
  ctx.moveTo(68, 54);
  ctx.bezierCurveTo(80, 65, 95, 82, 108, 85);

  // Dot for R.
  ctx.moveTo(114, 84);
  ctx.arc(114, 84, 1.5, 0, Math.PI * 2);

  // 'S' swoosh
  ctx.moveTo(125, 80);
  ctx.bezierCurveTo(126, 68, 140, 50, 148, 52);
  ctx.bezierCurveTo(154, 55, 140, 68, 136, 74);
  ctx.bezierCurveTo(134, 78, 146, 85, 156, 82);

  // Dot for S.
  ctx.moveTo(162, 82);
  ctx.arc(162, 82, 1.5, 0, Math.PI * 2);

  // 'N' sharp loop
  ctx.moveTo(172, 82);
  ctx.bezierCurveTo(174, 55, 178, 48, 180, 50);
  ctx.bezierCurveTo(185, 65, 196, 80, 200, 82);
  ctx.bezierCurveTo(202, 70, 206, 52, 208, 54);

  // Dot for N.
  ctx.moveTo(215, 82);
  ctx.arc(215, 82, 1.5, 0, Math.PI * 2);

  // 'M' bold lead & flowing cursive 'urthy'
  ctx.moveTo(230, 80);
  ctx.bezierCurveTo(234, 42, 242, 32, 248, 38);
  ctx.bezierCurveTo(254, 56, 260, 78, 264, 80);
  ctx.bezierCurveTo(268, 54, 276, 44, 282, 46);
  ctx.bezierCurveTo(286, 60, 292, 76, 298, 78);

  // 'u'
  ctx.bezierCurveTo(304, 68, 308, 66, 314, 78);
  // 'r'
  ctx.bezierCurveTo(318, 70, 322, 68, 326, 76);
  // 't' stem
  ctx.bezierCurveTo(330, 62, 334, 45, 336, 48);
  ctx.bezierCurveTo(336, 65, 338, 78, 344, 78);
  // 'h'
  ctx.bezierCurveTo(346, 46, 350, 42, 352, 45);
  ctx.bezierCurveTo(354, 62, 358, 76, 362, 76);
  // 'y' with descending flourish under the whole name
  ctx.bezierCurveTo(366, 68, 370, 68, 374, 78);
  ctx.bezierCurveTo(376, 88, 378, 105, 368, 110);
  ctx.bezierCurveTo(350, 112, 220, 106, 120, 102);
  ctx.bezierCurveTo(80, 100, 50, 102, 42, 104);

  // 't' crossbar
  ctx.moveTo(330, 58);
  ctx.lineTo(344, 56);

  ctx.stroke();

  return canvas.toDataURL('image/png');
};
