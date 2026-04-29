/**
 * PDF Standard Security Handler – Revision 3, RC4-128-bit encryption.
 * Pure-browser implementation (no Node APIs).
 * Spec: PDF 1.4 Reference §3.5
 */

/* ── MD5 ─────────────────────────────────────────────────────────── */
const MD5_K = new Int32Array([
  -680876936,-389564586,606105819,-1044525330,-176418897,1200080426,
  -1473231341,-45705983,1770035416,-1958414417,-42063,-1990404162,
  1804603682,-40341101,-1502002290,1236535329,-165796510,-1069501632,
  643717713,-373897302,-701558691,38016083,-660478335,-405537848,
  568446438,-1019803690,-187363961,1163531501,-1444681467,-51403784,
  1735328473,-1926607734,-378558,-2022574463,1839030562,-35309556,
  -1530992060,1272893353,-155497632,-1094730640,681279174,-358537222,
  -722521979,76029189,-640364487,-421815835,530742520,-995338651,
  -198630844,1126891415,-1416354905,-57434055,1700485571,-1894986606,
  -1051523,-2054922799,1873313359,-30611744,-1560198380,1309151649,
  -145523070,-1120210379,718787259,-343485551,
]);
const MD5_S = [
  7,12,17,22,7,12,17,22,7,12,17,22,7,12,17,22,
  5, 9,14,20,5, 9,14,20,5, 9,14,20,5, 9,14,20,
  4,11,16,23,4,11,16,23,4,11,16,23,4,11,16,23,
  6,10,15,21,6,10,15,21,6,10,15,21,6,10,15,21,
];

export function md5(data: Uint8Array): Uint8Array {
  const n = data.length;
  const totalLen = ((n + 72) >> 6) << 6;
  const buf = new Uint8Array(totalLen);
  buf.set(data);
  buf[n] = 0x80;
  const bits = n * 8;
  buf[totalLen - 8] = bits & 0xff;
  buf[totalLen - 7] = (bits >>> 8) & 0xff;
  buf[totalLen - 6] = (bits >>> 16) & 0xff;
  buf[totalLen - 5] = (bits >>> 24) & 0xff;

  let a = 0x67452301, b = 0xefcdab89 | 0, c = 0x98badcfe | 0, d = 0x10325476;

  for (let off = 0; off < totalLen; off += 64) {
    const w = new Int32Array(16);
    for (let i = 0; i < 16; i++)
      w[i] = buf[off+i*4] | (buf[off+i*4+1]<<8) | (buf[off+i*4+2]<<16) | (buf[off+i*4+3]<<24);
    let [A,B,C,D] = [a,b,c,d];
    for (let i = 0; i < 64; i++) {
      let F: number, g: number;
      if      (i<16) { F=(B&C)|(~B&D); g=i; }
      else if (i<32) { F=(D&B)|(~D&C); g=(5*i+1)&15; }
      else if (i<48) { F=B^C^D;        g=(3*i+5)&15; }
      else           { F=C^(B|~D);     g=(7*i)&15; }
      const s=MD5_S[i], tmp=(A+F+MD5_K[i]+w[g])|0;
      A=D; D=C; C=B; B=(B+((tmp<<s)|(tmp>>>(32-s))))|0;
    }
    a=(a+A)|0; b=(b+B)|0; c=(c+C)|0; d=(d+D)|0;
  }
  const out = new Uint8Array(16);
  [a,b,c,d].forEach((v,i)=>{
    out[i*4]=v&0xff; out[i*4+1]=(v>>>8)&0xff;
    out[i*4+2]=(v>>>16)&0xff; out[i*4+3]=(v>>>24)&0xff;
  });
  return out;
}

/* ── RC4 ─────────────────────────────────────────────────────────── */
export function rc4(key: Uint8Array, data: Uint8Array): Uint8Array {
  const S = new Uint8Array(256).map((_,i)=>i);
  let j=0;
  for (let i=0;i<256;i++){j=(j+S[i]+key[i%key.length])&0xff;const t=S[i];S[i]=S[j];S[j]=t;}
  let x=0,y=0;
  return data.map(b=>{x=(x+1)&0xff;y=(y+S[x])&0xff;const t=S[x];S[x]=S[y];S[y]=t;return b^S[(S[x]+S[y])&0xff];});
}

/* ── PDF Standard Security Handler ──────────────────────────────── */
const PW_PAD = new Uint8Array([
  0x28,0xBF,0x4E,0x5E,0x4E,0x75,0x8A,0x41,
  0x64,0x00,0x4E,0x56,0xFF,0xFA,0x01,0x08,
  0x2E,0x2E,0x00,0xB6,0xD0,0x68,0x3E,0x80,
  0x2F,0x0C,0xA9,0xFE,0x64,0x53,0x69,0x7A,
]);

function padPw(pw: string): Uint8Array {
  const enc = new TextEncoder().encode(pw).slice(0,32);
  const out = new Uint8Array(32); out.set(enc); out.set(PW_PAD.slice(0,32-enc.length),enc.length);
  return out;
}

function ownerKey(userPw: string, ownerPw: string, keyLen=16): Uint8Array {
  let key = md5(padPw(ownerPw)).slice(0,keyLen);
  for (let i=0;i<50;i++) key=md5(key).slice(0,keyLen);
  let res = rc4(key, padPw(userPw));
  for (let i=1;i<=19;i++) res=rc4(key.map(b=>b^i),res);
  return res;
}

function encKey(userPw: string, O: Uint8Array, P: number, fileId: Uint8Array, keyLen=16): Uint8Array {
  const buf=new Uint8Array(32+32+4+fileId.length);
  buf.set(padPw(userPw)); buf.set(O,32);
  buf[64]=P&0xff;buf[65]=(P>>8)&0xff;buf[66]=(P>>16)&0xff;buf[67]=(P>>24)&0xff;
  buf.set(fileId,68);
  let key=md5(buf).slice(0,keyLen);
  for (let i=0;i<50;i++) key=md5(key).slice(0,keyLen);
  return key;
}

function userKey(ek: Uint8Array, fileId: Uint8Array): Uint8Array {
  const buf=new Uint8Array(PW_PAD.length+fileId.length);
  buf.set(PW_PAD); buf.set(fileId,PW_PAD.length);
  let res=rc4(ek,md5(buf));
  for (let i=1;i<=19;i++) res=rc4(ek.map(b=>b^i),res);
  const U=new Uint8Array(32); U.set(res); return U;
}

function objKey(ek: Uint8Array, num: number, gen: number): Uint8Array {
  const buf=new Uint8Array(ek.length+5);
  buf.set(ek);
  buf[ek.length]=num&0xff;buf[ek.length+1]=(num>>8)&0xff;buf[ek.length+2]=(num>>16)&0xff;
  buf[ek.length+3]=gen&0xff;buf[ek.length+4]=(gen>>8)&0xff;
  return md5(buf).slice(0,Math.min(ek.length+5,16));
}

/* ── PDF byte-level encryptor ────────────────────────────────────── */
function toLatinStr(bytes: Uint8Array): string {
  // Chunk to avoid call-stack overflow on large files
  const CHUNK = 8192;
  let s = "";
  for (let i=0;i<bytes.length;i+=CHUNK)
    s += String.fromCharCode(...bytes.subarray(i,i+CHUNK));
  return s;
}
function fromLatinStr(s: string): Uint8Array {
  const out = new Uint8Array(s.length);
  for (let i=0;i<s.length;i++) out[i]=s.charCodeAt(i)&0xff;
  return out;
}

function hexEncode(bytes: Uint8Array): string {
  return "<"+Array.from(bytes,b=>b.toString(16).padStart(2,"0")).join("")+">";
}

// Parse literal string starting at s[i] (where s[i]==='(')
// Returns {bytes, end} where end is the index of the closing ')'
function parseLiteral(s: string, i: number): {bytes:number[];end:number} {
  const bytes:number[]=[]; let depth=1; let p=i+1;
  while (p<s.length) {
    const c=s.charCodeAt(p);
    if (c===0x5C) { // backslash
      p++; const n=s.charCodeAt(p);
      if (n===0x6E){bytes.push(10);p++;}
      else if(n===0x72){bytes.push(13);p++;}
      else if(n===0x74){bytes.push(9);p++;}
      else if(n===0x62){bytes.push(8);p++;}
      else if(n===0x66){bytes.push(12);p++;}
      else if(n>=0x30&&n<=0x37){
        let oc=n-0x30;p++;
        if(s.charCodeAt(p)>=0x30&&s.charCodeAt(p)<=0x37){oc=oc*8+s.charCodeAt(p++)-0x30;}
        if(s.charCodeAt(p)>=0x30&&s.charCodeAt(p)<=0x37){oc=oc*8+s.charCodeAt(p++)-0x30;}
        bytes.push(oc&0xff);
      } else if(n===0x0D){p++;if(s.charCodeAt(p)===0x0A)p++;}
      else if(n===0x0A){p++;}
      else{bytes.push(n);p++;}
    } else if(c===0x28){depth++;bytes.push(40);p++;}
    else if(c===0x29){depth--;if(depth===0)return{bytes,end:p};bytes.push(41);p++;}
    else{bytes.push(c);p++;}
  }
  return {bytes,end:p-1};
}

// Encrypt all literal/hex strings in a dict portion (not stream content)
function encryptDictStrings(dict: string, key: Uint8Array): string {
  let out="",i=0;
  while(i<dict.length){
    const c=dict[i];
    if(c==="%"){ // comment: copy to EOL
      const nl=dict.indexOf("\n",i); const end=nl===-1?dict.length:nl+1;
      out+=dict.slice(i,end); i=end;
    } else if(c==="("){
      const {bytes,end}=parseLiteral(dict,i);
      const enc=rc4(key,new Uint8Array(bytes));
      out+=hexEncode(enc); i=end+1;
    } else if(c==="<"&&dict[i+1]!=="<"){
      const close=dict.indexOf(">",i+1); if(close===-1){out+=c;i++;continue;}
      const hex=dict.slice(i+1,close).replace(/\s/g,"");
      const bytes=new Uint8Array(Math.ceil(hex.length/2));
      for(let j=0;j<bytes.length;j++)
        bytes[j]=parseInt(hex.slice(j*2,(j+1)*2)||"0",16);
      out+=hexEncode(rc4(key,bytes)); i=close+1;
    } else {out+=c;i++;}
  }
  return out;
}

interface ParsedObj { num:number;gen:number;fullMatch:string;body:string;startIdx:number; }

function parseObjects(pdfStr: string): ParsedObj[] {
  const objs: ParsedObj[] = [];
  const re=/(\d+) (\d+) obj[\r\n]/g; let m;
  while((m=re.exec(pdfStr))!==null){
    const bodyStart=m.index+m[0].length;
    let end=pdfStr.indexOf("\nendobj",bodyStart);
    if(end===-1) continue;
    const bodyEnd=end;
    objs.push({num:+m[1],gen:+m[2],fullMatch:m[0],body:pdfStr.slice(bodyStart,bodyEnd),startIdx:m.index});
  }
  return objs;
}

export function encryptPdf(input: Uint8Array, userPw: string, ownerPw: string, allowPrint=false): Uint8Array {
  const KEY_LEN=16;
  const fileId=crypto.getRandomValues(new Uint8Array(16));
  const fileIdHex=Array.from(fileId,b=>b.toString(16).padStart(2,"0")).join("");

  // Permission flags (signed 32-bit): bits 12-31 must be 1, rest 0 except allowed ops
  let P = -4096; // 0xFFFFF000 – all restricted
  if(allowPrint) P |= 4; // bit 2: low-res print

  const O = ownerKey(userPw, ownerPw, KEY_LEN);
  const EK = encKey(userPw, O, P, fileId, KEY_LEN);
  const U = userKey(EK, fileId);

  const pdfStr = toLatinStr(input);
  const objs = parseObjects(pdfStr);
  const maxNum = objs.reduce((m,o)=>Math.max(m,o.num),0);
  const encObjNum = maxNum+1;

  // Build new PDF parts, tracking offsets for xref
  const enc = new TextEncoder();
  const parts: Uint8Array[] = [];
  const offsets = new Map<string,number>(); // "num gen" -> byte offset
  let pos=0;

  function push(s: string) { const b=fromLatinStr(s); parts.push(b); pos+=b.length; }

  // Header
  push("%PDF-1.4\n%\xe2\xe3\xcf\xd3\n");

  for(const obj of objs){
    offsets.set(`${obj.num} ${obj.gen}`, pos);
    // Split body into dict-part and stream-part
    const streamMatch=obj.body.match(/stream(\r\n|\n)/);
    let newBody: string;
    if(streamMatch&&streamMatch.index!==undefined){
      const si=streamMatch.index;
      const dictPart=obj.body.slice(0,si);
      const afterMarker=si+streamMatch[0].length;
      // Get /Length
      const lenMatch=dictPart.match(/\/Length\s+(\d+)/);
      const streamLen=lenMatch?+lenMatch[1]:0;
      const streamBytes=fromLatinStr(obj.body.slice(afterMarker,afterMarker+streamLen));
      const encStream=rc4(objKey(EK,obj.num,obj.gen),streamBytes);
      const encDict=encryptDictStrings(dictPart,objKey(EK,obj.num,obj.gen));
      // Reconstruct stream
      const eol=streamMatch[1];
      const afterStream=obj.body.slice(afterMarker+streamLen); // usually \nendstream
      newBody=encDict+"stream"+eol+toLatinStr(encStream)+afterStream;
    } else {
      newBody=encryptDictStrings(obj.body,objKey(EK,obj.num,obj.gen));
    }
    push(`${obj.num} ${obj.gen} obj\n${newBody}\nendobj\n`);
  }

  // /Encrypt dictionary object
  offsets.set(`${encObjNum} 0`, pos);
  const OHex=Array.from(O,b=>b.toString(16).padStart(2,"0")).join("");
  const UHex=Array.from(U,b=>b.toString(16).padStart(2,"0")).join("");
  push(
    `${encObjNum} 0 obj\n`+
    `<</Filter /Standard /V 2 /R 3 /Length 128`+
    ` /P ${P}`+
    ` /O <${OHex}>`+
    ` /U <${UHex}>>` +
    `\nendobj\n`
  );

  // xref table
  const xrefPos=pos;
  const allNums=[...objs.map(o=>({num:o.num,gen:o.gen})),{num:encObjNum,gen:0}]
    .sort((a,b)=>a.num-b.num);
  const tableSize=allNums[allNums.length-1].num+2;
  let xref=`xref\n0 ${tableSize}\n`;
  xref+="0000000000 65535 f \n"; // entry 0
  for(let n=1;n<tableSize;n++){
    const found=allNums.find(o=>o.num===n);
    if(found){
      const off=offsets.get(`${found.num} ${found.gen}`)??0;
      xref+=off.toString().padStart(10,"0")+" "+found.gen.toString().padStart(5,"0")+" n \n";
    } else {
      xref+="0000000000 00000 f \n";
    }
  }

  // Trailer – patch original trailer to add /Encrypt and /ID
  const origTrailerMatch=pdfStr.match(/trailer\s*<<([\s\S]*?)>>/);
  let trailerDict=origTrailerMatch?origTrailerMatch[1]:"";
  // Remove old /ID if present, add fresh one
  trailerDict=trailerDict.replace(/\/ID\s*\[[\s\S]*?\]/,"");
  trailerDict=trailerDict.replace(/\/Size\s+\d+/,`/Size ${tableSize}`);
  if(!/\/Root/.test(trailerDict)) trailerDict+=" /Root 1 0 R";
  push(xref+`trailer\n<<${trailerDict} /Encrypt ${encObjNum} 0 R /ID [<${fileIdHex}><${fileIdHex}>]>>\nstartxref\n${xrefPos}\n%%EOF\n`);

  // Merge all parts
  const totalLen=parts.reduce((s,p)=>s+p.length,0);
  const result=new Uint8Array(totalLen);
  let offset=0;
  for(const p of parts){result.set(p,offset);offset+=p.length;}
  return result;
}
