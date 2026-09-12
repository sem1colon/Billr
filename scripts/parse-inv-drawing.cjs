const fs = require('fs');
const zlib = require('zlib');
const buf = fs.readFileSync('C:\\Users\\vk185170\\Downloads\\Inv.004_121102.pdf');
const pdfStr = buf.toString('latin1');

function getDecompressedObj(num) {
  const marker = `${num} 0 obj`;
  const objStart = pdfStr.indexOf(marker);
  if (objStart === -1) return null;
  const streamMatch = pdfStr.slice(objStart).match(/stream[\r\n]+/);
  if (!streamMatch) return null;
  const start = objStart + streamMatch.index + streamMatch[0].length;
  const end = pdfStr.indexOf('endstream', start);
  const raw = buf.subarray(start, end);
  return zlib.inflateSync(raw);
}

const content = getDecompressedObj(32).toString('latin1');
console.log('--- ALL DRAWING OPERATIONS (re, lines, colors) ---');
const drawOps = content.match(/([0-9\.\-\s]+(re|m|l|c|v|y|rg|RG|sc|SC|cs|CS|w|S|s|f|F|B|b|h))/g) || [];
console.log('Total drawing operations:', drawOps.length);

// Let's print rectangles (x, y, w, h)
const rects = [];
const reRegex = /([\d\.\-]+)\s+([\d\.\-]+)\s+([\d\.\-]+)\s+([\d\.\-]+)\s+re/g;
let m;
while ((m = reRegex.exec(content)) !== null) {
  rects.push({
    x: parseFloat(m[1]),
    y: parseFloat(m[2]),
    w: parseFloat(m[3]),
    h: parseFloat(m[4]),
  });
}

console.log('--- RECTANGLES ---');
rects.forEach(r => console.log(`x=${r.x}, y=${r.y}, w=${r.w}, h=${r.h}`));

// Let's print lines (m followed by l)
console.log('--- LINES ---');
const lineRegex = /([\d\.\-]+)\s+([\d\.\-]+)\s+m\s+([\d\.\-]+)\s+([\d\.\-]+)\s+l/g;
while ((m = lineRegex.exec(content)) !== null) {
  console.log(`Line from (${m[1]}, ${m[2]}) to (${m[3]}, ${m[4]})`);
}
