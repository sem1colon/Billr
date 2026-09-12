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

function parseCMap(decomp) {
  const str = decomp.toString('latin1');
  const map = {};
  const bfrangeRegex = /<([0-9a-fA-F]+)>\s*<([0-9a-fA-F]+)>\s*<([0-9a-fA-F]+)>/g;
  let rm;
  while ((rm = bfrangeRegex.exec(str)) !== null) {
    const srcStart = parseInt(rm[1], 16);
    const srcEnd = parseInt(rm[2], 16);
    let dstStart = parseInt(rm[3], 16);
    for (let s = srcStart; s <= srcEnd; s++) {
      map[s] = String.fromCharCode(dstStart++);
    }
  }
  const bfcharRegex = /<([0-9a-fA-F]+)>\s*<([0-9a-fA-F]+)>/g;
  while ((rm = bfcharRegex.exec(str)) !== null) {
    const src = parseInt(rm[1], 16);
    const dst = parseInt(rm[2], 16);
    map[src] = String.fromCharCode(dst);
  }
  return map;
}

// CMaps are in obj 9, 15, 21, 27
// Let's check page resources font map in the PDF
console.log('--- FONT DEFINITIONS ---');
console.log(pdfStr.match(/\/Font\s*<<[\s\S]*?>>/g));
console.log(pdfStr.match(/\d+\s+0\s+obj[\s\S]*?\/BaseFont[\s\S]*?endobj/g));

const fontCMaps = {
  '/TT0': parseCMap(getDecompressedObj(9)),  // or check which font is which
  '/TT1': parseCMap(getDecompressedObj(15)),
  '/TT2': parseCMap(getDecompressedObj(21)),
  '/TT3': parseCMap(getDecompressedObj(27)),
  '/F1': parseCMap(getDecompressedObj(9)),
  '/F2': parseCMap(getDecompressedObj(15)),
  '/F3': parseCMap(getDecompressedObj(21)),
  '/F4': parseCMap(getDecompressedObj(27)),
};

// Also let's inspect obj 32 content
const content = getDecompressedObj(32).toString('latin1');
const linesArr = content.split(/[\r\n]+/);

let font = '';
let size = '';
let x = 0, y = 0;
let output = [];

for (let i = 0; i < linesArr.length; i++) {
  const line = linesArr[i].trim();
  const tfMatch = line.match(/\/(\w+)\s+([\d\.]+)\s+Tf/);
  if (tfMatch) {
    font = '/' + tfMatch[1];
    size = tfMatch[2];
  }
  const tmMatch = line.match(/([\d\.\-]+)\s+([\d\.\-]+)\s+([\d\.\-]+)\s+([\d\.\-]+)\s+([\d\.\-]+)\s+([\d\.\-]+)\s+Tm/);
  if (tmMatch) {
    x = parseFloat(tmMatch[5]);
    y = parseFloat(tmMatch[6]);
  }
  const tdMatch = line.match(/([\d\.\-]+)\s+([\d\.\-]+)\s+Td/);
  if (tdMatch) {
    x += parseFloat(tdMatch[1]);
    y += parseFloat(tdMatch[2]);
  }
  
  // Tj match
  const tjMatch = line.match(/<([0-9a-fA-F]+)>\s*Tj/);
  if (tjMatch) {
    const hex = tjMatch[1];
    let decoded = '';
    const cmap = fontCMaps[font] || {};
    for (let h = 0; h < hex.length; h += 4) {
      const code = parseInt(hex.substr(h, 4), 16);
      decoded += cmap[code] !== undefined ? cmap[code] : ('[' + code.toString(16) + ']');
    }
    output.push({ x: Math.round(x*100)/100, y: Math.round(y*100)/100, font, size, text: decoded });
  }

  // TJ match
  const tjArrMatch = line.match(/\[(.*?)\]\s*TJ/);
  if (tjArrMatch) {
    const inner = tjArrMatch[1];
    let decoded = '';
    const cmap = fontCMaps[font] || {};
    const parts = inner.match(/<[0-9a-fA-F]+>|[\d\.\-]+/g) || [];
    for (const p of parts) {
      if (p.startsWith('<') && p.endsWith('>')) {
        const hex = p.slice(1, -1);
        for (let h = 0; h < hex.length; h += 4) {
          const code = parseInt(hex.substr(h, 4), 16);
          decoded += cmap[code] !== undefined ? cmap[code] : ('[' + code.toString(16) + ']');
        }
      }
    }
    output.push({ x: Math.round(x*100)/100, y: Math.round(y*100)/100, font, size, text: decoded });
  }
}

// Sort by Y descending, then X ascending
output.sort((a, b) => {
  if (Math.abs(a.y - b.y) > 2) return b.y - a.y;
  return a.x - b.x;
});

// Group lines with similar y
let grouped = [];
let currY = null;
let currLine = [];

for (const item of output) {
  if (currY === null || Math.abs(item.y - currY) > 2.5) {
    if (currLine.length > 0) grouped.push({ y: currY, items: currLine });
    currY = item.y;
    currLine = [item];
  } else {
    currLine.push(item);
  }
}
if (currLine.length > 0) grouped.push({ y: currY, items: currLine });

console.log('=== EXACT TEXT & POSITIONS IN REFERENCE INVOICE ===');
grouped.forEach(g => {
  const lineStr = g.items.map(it => `[x=${it.x}, ${it.size}pt, ${it.font}] "${it.text}"`).join('  |  ');
  console.log(`Y=${g.y}:  ${lineStr}`);
});

console.log('\n=== COMPLETE INVOICE READOUT ===');
grouped.forEach(g => {
  const lineText = g.items.map(it => it.text).join('   ');
  console.log(lineText);
});
