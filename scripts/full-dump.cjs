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

// CMaps
function parseCMap(decomp) {
  if (!decomp) return {};
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

const fontCMaps = {
  '/F1': parseCMap(getDecompressedObj(9)),  // Arial-BoldMT
  '/F2': parseCMap(getDecompressedObj(15)), // ArialMT
  '/F3': parseCMap(getDecompressedObj(21)), // Arial-Black
  '/F4': parseCMap(getDecompressedObj(27)), // MicrosoftSansSerif
};

const content = getDecompressedObj(32).toString('latin1');

// Tokenize PDF stream
let tokens = [];
let re = /\/(\w+)|\[(.*?)\]\s*TJ|<([0-9a-fA-F]+)>\s*Tj|([\d\.\-]+)\s+([\d\.\-]+)\s+([\d\.\-]+)\s+([\d\.\-]+)\s+([\d\.\-]+)\s+([\d\.\-]+)\s+Tm|([\d\.\-]+)\s+([\d\.\-]+)\s+Td|([\d\.\.]+)\s+Tf|([a-zA-Z]+)/g;

// Let's parse text commands with current matrix and font
const lines = content.split(/[\r\n]+/);
let currFont = '';
let currSize = 0;
let currMatrix = [1, 0, 0, 1, 0, 0];
let items = [];

for (let i = 0; i < lines.length; i++) {
  const line = lines[i].trim();
  let m;
  if ((m = line.match(/\/(\w+)\s+([\d\.]+)\s+Tf/))) {
    currFont = '/' + m[1];
    currSize = parseFloat(m[2]);
  } else if ((m = line.match(/([\d\.\-]+)\s+([\d\.\-]+)\s+([\d\.\-]+)\s+([\d\.\-]+)\s+([\d\.\-]+)\s+([\d\.\-]+)\s+Tm/))) {
    currMatrix = [parseFloat(m[1]), parseFloat(m[2]), parseFloat(m[3]), parseFloat(m[4]), parseFloat(m[5]), parseFloat(m[6])];
  } else if ((m = line.match(/([\d\.\-]+)\s+([\d\.\-]+)\s+Td/))) {
    currMatrix[4] += parseFloat(m[1]);
    currMatrix[5] += parseFloat(m[2]);
  } else if ((m = line.match(/<([0-9a-fA-F]+)>\s*Tj/))) {
    const hex = m[1];
    let decoded = '';
    const cmap = fontCMaps[currFont] || {};
    for (let h = 0; h < hex.length; h += 4) {
      const code = parseInt(hex.substr(h, 4), 16);
      decoded += cmap[code] !== undefined ? cmap[code] : `[${code.toString(16)}]`;
    }
    items.push({ x: currMatrix[4], y: currMatrix[5], font: currFont, size: currSize, text: decoded });
  } else if ((m = line.match(/\[(.*?)\]\s*TJ/))) {
    const inner = m[1];
    let decoded = '';
    const cmap = fontCMaps[currFont] || {};
    const parts = inner.match(/<[0-9a-fA-F]+>|[\d\.\-]+/g) || [];
    for (const p of parts) {
      if (p.startsWith('<') && p.endsWith('>')) {
        const hex = p.slice(1, -1);
        for (let h = 0; h < hex.length; h += 4) {
          const code = parseInt(hex.substr(h, 4), 16);
          decoded += cmap[code] !== undefined ? cmap[code] : `[${code.toString(16)}]`;
        }
      }
    }
    items.push({ x: currMatrix[4], y: currMatrix[5], font: currFont, size: currSize, text: decoded });
  }
}

// Clean up any CMap glyph translation quirks
items.forEach(it => {
  it.cleanText = it.text
    .replace(/3/g, (match, offset, str) => {
      // In F1/F3 some CMap chars were L or l or 3
      return '3';
    });
});

console.log('--- ALL TEXT ITEMS SORTED TOP TO BOTTOM ---');
items.sort((a, b) => b.y - a.y || a.x - b.x);

items.forEach(it => {
  console.log(`y=${it.y.toFixed(1)}, x=${it.x.toFixed(1)} [${it.font} ${it.size}pt]: "${it.text}"`);
});
