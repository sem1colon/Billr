const fs = require('fs');
const zlib = require('zlib');
const buf = fs.readFileSync('C:\\Users\\vk185170\\Downloads\\Inv.004_121102.pdf');

// Collect all streams
let pos = 0;
let streams = [];
while ((pos = buf.indexOf(Buffer.from('stream'), pos)) !== -1) {
  let start = pos + 6;
  if (buf[start] === 0x0d && buf[start+1] === 0x0a) start += 2;
  else if (buf[start] === 0x0a || buf[start] === 0x0d) start += 1;
  const end = buf.indexOf(Buffer.from('endstream'), start);
  if (end === -1) break;
  const streamData = buf.subarray(start, end);
  try {
    const decomp = zlib.inflateSync(streamData);
    streams.push(decomp);
  } catch(e) {
    streams.push(null);
  }
  pos = end + 9;
}

// Parse CMaps from text streams
const cmaps = {};
streams.forEach((st, idx) => {
  if (!st) return;
  const str = st.toString('latin1');
  if (str.includes('begincmap')) {
    const map = {};
    const bfrangeRegex = /<([0-9a-fA-F]+)>\s*<([0-9a-fA-F]+)>\s*<([0-9a-fA-F]+)>/g;
    let m;
    while ((m = bfrangeRegex.exec(str)) !== null) {
      const srcStart = parseInt(m[1], 16);
      const srcEnd = parseInt(m[2], 16);
      let dstStart = parseInt(m[3], 16);
      for (let s = srcStart; s <= srcEnd; s++) {
        map[s] = String.fromCharCode(dstStart++);
      }
    }
    const bfcharRegex = /<([0-9a-fA-F]+)>\s*<([0-9a-fA-F]+)>/g;
    while ((m = bfcharRegex.exec(str)) !== null) {
      const src = parseInt(m[1], 16);
      const dst = parseInt(m[2], 16);
      map[src] = String.fromCharCode(dst);
    }
    cmaps[idx] = map;
  }
});

// Let's find font names from root
const rawPdf = buf.toString('latin1');
console.log('--- FONT NAMES IN RAW PDF ---');
const fontMatches = rawPdf.match(/\/BaseFont\s*\/([^\s\/]+)/g) || [];
console.log(fontMatches);

const fontMap = {
  '/TT0': cmaps[6], // Arial-Black
  '/TT1': cmaps[2], // Arial-BoldMT
  '/TT2': cmaps[4], // ArialMT
  '/TT3': cmaps[8], // MicrosoftSansSerif
};

const contentStream = streams[10].toString('latin1');
const linesArr = contentStream.split('\n');
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
    const cmap = fontMap[font] || {};
    for (let h = 0; h < hex.length; h += 4) {
      const code = parseInt(hex.substr(h, 4), 16);
      decoded += cmap[code] || ('[' + code.toString(16) + ']');
    }
    output.push({ x: Math.round(x*10)/10, y: Math.round(y*10)/10, font, size, text: decoded });
  }

  // TJ match
  const tjArrMatch = line.match(/\[(.*?)\]\s*TJ/);
  if (tjArrMatch) {
    const inner = tjArrMatch[1];
    let decoded = '';
    const cmap = fontMap[font] || {};
    const parts = inner.match(/<[0-9a-fA-F]+>|[\d\.\-]+/g) || [];
    for (const p of parts) {
      if (p.startsWith('<') && p.endsWith('>')) {
        const hex = p.slice(1, -1);
        for (let h = 0; h < hex.length; h += 4) {
          const code = parseInt(hex.substr(h, 4), 16);
          decoded += cmap[code] || ('[' + code.toString(16) + ']');
        }
      }
    }
    output.push({ x: Math.round(x*10)/10, y: Math.round(y*10)/10, font, size, text: decoded });
  }
}

// Sort by Y descending (PDF coordinates 0,0 is bottom-left), then X ascending
output.sort((a, b) => {
  if (Math.abs(a.y - b.y) > 2) return b.y - a.y;
  return a.x - b.x;
});

// Group lines that have similar y
let grouped = [];
let currY = null;
let currLine = [];

for (const item of output) {
  if (currY === null || Math.abs(item.y - currY) > 3) {
    if (currLine.length > 0) grouped.push({ y: currY, items: currLine });
    currY = item.y;
    currLine = [item];
  } else {
    currLine.push(item);
  }
}
if (currLine.length > 0) grouped.push({ y: currY, items: currLine });

console.log('--- EXTRACTED INVOICE LAYOUT & TEXT ---');
grouped.forEach(g => {
  const lineStr = g.items.map(it => `[x=${it.x}, ${it.size}pt, ${it.font}] "${it.text}"`).join('  |  ');
  console.log(`Y=${g.y}:  ${lineStr}`);
});

console.log('\n--- FULL TEXT RECONSTRUCTION ---');
grouped.forEach(g => {
  const lineText = g.items.map(it => it.text).join(' ');
  console.log(lineText);
});
