#!/usr/bin/env node
import fs from "fs";
import path from "path";

const inputDir = path.resolve(process.argv[2] || "/Applications/codes/chemwebsite/test");
const outputPdf = path.resolve(
  process.argv[3] || path.join(inputDir, "merged_images.pdf")
);

function isJpegLike(p) {
  return /\.(jfif|jpe?g)$/i.test(p);
}

function jpegSize(buf) {
  if (!(buf.length > 4 && buf[0] === 0xff && buf[1] === 0xd8)) {
    throw new Error("Not a JPEG/JFIF file");
  }
  let i = 2;
  while (i < buf.length - 1) {
    if (buf[i] !== 0xff) {
      i += 1;
      continue;
    }
    const marker = buf[i + 1];
    i += 2;
    if (marker === 0xd8 || marker === 0xd9) continue;
    if (marker === 0xda) break; // SOS
    if (i + 2 > buf.length) break;
    const segLen = (buf[i] << 8) + buf[i + 1];
    if (segLen < 2 || i + segLen > buf.length) break;
    if (marker === 0xc0 || marker === 0xc1 || marker === 0xc2) {
      const h = (buf[i + 3] << 8) + buf[i + 4];
      const w = (buf[i + 5] << 8) + buf[i + 6];
      return { w, h };
    }
    i += segLen;
  }
  throw new Error("Cannot read JPEG/JFIF dimensions");
}

function buildPdf(images) {
  const objects = [];
  const pushObj = (num, body) => objects.push({ num, body });

  pushObj(1, Buffer.from("<< /Type /Catalog /Pages 2 0 R >>", "latin1"));

  const pageObjs = [];
  const imageObjs = [];
  const contentObjs = [];

  images.forEach((img, idx) => {
    const imageObjNum = 3 + idx * 3;
    const contentObjNum = imageObjNum + 1;
    const pageObjNum = imageObjNum + 2;
    const n = idx + 1;

    const imgHead =
      `<< /Type /XObject /Subtype /Image /Width ${img.w} /Height ${img.h} ` +
      `/ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${img.data.length} >>\nstream\n`;
    const imgBody = Buffer.concat([
      Buffer.from(imgHead, "latin1"),
      img.data,
      Buffer.from("\nendstream", "latin1")
    ]);
    imageObjs.push({ num: imageObjNum, body: imgBody });

    const draw = `q\n${img.w} 0 0 ${img.h} 0 0 cm\n/Im${n} Do\nQ\n`;
    const drawBuf = Buffer.from(draw, "latin1");
    const contentBody = Buffer.concat([
      Buffer.from(`<< /Length ${drawBuf.length} >>\nstream\n`, "latin1"),
      drawBuf,
      Buffer.from("endstream", "latin1")
    ]);
    contentObjs.push({ num: contentObjNum, body: contentBody });

    const page = `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${img.w} ${img.h}] ` +
      `/Resources << /XObject << /Im${n} ${imageObjNum} 0 R >> >> ` +
      `/Contents ${contentObjNum} 0 R >>`;
    pageObjs.push({ num: pageObjNum, body: Buffer.from(page, "latin1") });
  });

  const kids = pageObjs.map((x) => `${x.num} 0 R`).join(" ");
  pushObj(2, Buffer.from(`<< /Type /Pages /Count ${pageObjs.length} /Kids [ ${kids} ] >>`, "latin1"));
  imageObjs.forEach((x) => pushObj(x.num, x.body));
  contentObjs.forEach((x) => pushObj(x.num, x.body));
  pageObjs.forEach((x) => pushObj(x.num, x.body));

  objects.sort((a, b) => a.num - b.num);
  const maxObj = objects[objects.length - 1].num;

  let pdf = Buffer.from("%PDF-1.4\n%\xE2\xE3\xCF\xD3\n", "binary");
  const offsets = new Array(maxObj + 1).fill(0);
  for (const obj of objects) {
    offsets[obj.num] = pdf.length;
    pdf = Buffer.concat([
      pdf,
      Buffer.from(`${obj.num} 0 obj\n`, "latin1"),
      obj.body,
      Buffer.from("\nendobj\n", "latin1")
    ]);
  }

  const xrefPos = pdf.length;
  let xref = `xref\n0 ${maxObj + 1}\n0000000000 65535 f \n`;
  for (let i = 1; i <= maxObj; i++) {
    xref += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  }
  const trailer = `trailer\n<< /Size ${maxObj + 1} /Root 1 0 R >>\nstartxref\n${xrefPos}\n%%EOF\n`;
  pdf = Buffer.concat([pdf, Buffer.from(xref + trailer, "latin1")]);
  return pdf;
}

const files = fs
  .readdirSync(inputDir)
  .filter(isJpegLike)
  .sort((a, b) => a.localeCompare(b, "en", { numeric: true }))
  .map((name) => path.join(inputDir, name));

if (!files.length) {
  console.error(`No .jfif/.jpg/.jpeg files found in ${inputDir}`);
  process.exit(1);
}

const images = files.map((p) => {
  const data = fs.readFileSync(p);
  const { w, h } = jpegSize(data);
  return { p, data, w, h };
});

const pdf = buildPdf(images);
fs.writeFileSync(outputPdf, pdf);
console.log(`Created: ${outputPdf}`);
console.log(`Pages: ${images.length}`);
