const fs = require('fs');
const zlib = require('zlib');
const buf = fs.readFileSync('C:\\Users\\vk185170\\Downloads\\Inv.004_121102.pdf');

// Parse PDF objects
const pdfStr = buf.toString('latin1');
const objRegex = /(\d+)\s+0\s+obj([\s\S]*?)endobj/g;
let m;
const objects = {};

while ((m = objRegex.exec(pdfStr)) !== null) {
  const objNum = parseInt(m[1], 10);
  const content = m[2];
  
  // check if has stream
  const streamIdx = content.indexOf('stream\n') !== -1 ? content.indexOf('stream\n') + 7 : (content.indexOf('stream\r\n') !== -1 ? content.indexOf('stream\r\n') + 8 : -1);
  if (streamIdx !== -1) {
    const endstreamIdx = content.indexOf('endstream');
    const rawStream = buf.subarray(m.index + streamIdx, m.index + endstreamIdx);
    let decomp = null;
    try {
      decomp = zlib.inflateSync(rawStream);
    } catch(e) {
      decomp = rawStream;
    }
    objects[objNum] = { header: content.slice(0, streamIdx), stream: decomp };
  } else {
    objects[objNum] = { header: content, stream: null };
  }
}

// Map Font F1, F2, F3, F4
// F1 is 6 0 R -> find 6 0 obj -> /ToUnicode (X 0 R)
function getCMapForFontObj(fontObjNum) {
  const fontObj = objects[fontObjNum];
  if (!fontObj) return {};
  const toUnicodeMatch = fontObj.header.match(/\/ToUnicode\s+(\d+)\s+0\s+R/);
  if (!toUnicodeMatch) return {};
  const unicodeObjNum = parseInt(toUnicodeMatch[1], 10);
  const unicodeObj = objects[unicodeObjNum];
  if (!unicodeObj || !unicodeObj.stream) return {};
  
  const cMapStr = unicodeObj.stream.toString('latin1');
  const map = {};
  
  const bfrangeRegex = /<([0-9a-fA-F]+)>\s*<([0-9a-fA-F]+)>\s*<([0-9a-fA-F]+)>/g;
  let rm;
  while ((rm = bfrangeRegex.exec(cMapStr)) !== null) {
    const srcStart = parseInt(rm[1], 16);
    const srcEnd = parseInt(rm[2], 16);
    let dstStart = parseInt(rm[3], 16);
    for (let s = srcStart; s <= srcEnd; s++) {
      map[s] = String.fromCharCode(dstStart++);
    }
  }
  const bfcharRegex = /<([0-9a-fA-F]+)>\s*<([0-9a-fA-F]+)>/g;
  while ((rm = bfcharRegex.exec(cMapStr)) !== null) {
    const src = parseInt(rm[1], 16);
    const dst = parseInt(rm[2], 16);
    map[src] = String.fromCharCode(dst);
  }
  return map;
}

const fontCMaps = {
  '/F1': getCMapForFontObj(6),  // Arial-BoldMT
  '/F2': getCMapForFontObj(12), // ArialMT
  '/F3': getCMapForFontObj(18), // Arial-Black
  '/F4': getCMapForFontObj(24), // MicrosoftSansSerif
};

// Find object with content stream
console.log('Object keys with streams:');
let pageStream = null;
for (const k in objects) {
  if (objects[k].stream) {
    const s = objects[k].stream.toString('latin1');
    if (s.includes('Tf') || s.includes('Tj') || s.includes('TJ')) {
      console.log('Found page stream at obj', k);
      pageStream = s;
      break;
    }
  }
}

if (!pageStream) {
  console.log('No page stream found!');
  process.exit(1);
}

const linesArr = pageStream.split('\n');
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
