import fs from '@ohos.file.fs';
// 使用 Harmony 专用的 JSZip 依赖，避免引用到仓库根目录的 Node 版依赖。
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import JSZip from '@ohos/jszip';

export interface SlideNotePayload {
  notes: string;
}

// Map of locale hints for PowerPoint
const LANG_MAP: Record<string, string> = {
  'en': 'en-US',
  'zh': 'zh-CN',
  'es': 'es-ES',
  'fr': 'fr-FR',
  'de': 'de-DE',
  'ja': 'ja-JP',
  'ko': 'ko-KR'
};

const NOTES_MASTER_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:notesMaster xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
    <p:cSld>
        <p:bg><p:bgPr><a:solidFill><a:schemeClr val="lt1"/></a:solidFill></p:bgPr></p:bg>
        <p:spTree>
            <p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr>
            <p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr>
            <p:sp><p:nvSpPr><p:cNvPr id="5" name="Body Placeholder"/><p:cNvSpPr><a:spLocks noGrp="1"/></p:cNvSpPr><p:nvPr><p:ph type="body" idx="1"/></p:nvPr></p:nvSpPr><p:spPr/><p:txBody><a:bodyPr/><a:lstStyle/><a:p><a:endParaRPr/></a:p></p:txBody></p:sp>
        </p:spTree>
    </p:cSld>
    <p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr>
</p:notesMaster>`;

const escapeXml = (unsafe: string): string => {
  return unsafe.replace(/[<>&'\"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case "'": return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
};

const createNotesSlideXML = (slideIndex: number, text: string): string => {
  const escaped = escapeXml(text);
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:notes xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:commonSlideData>
    <p:shapeTree>
      <p:nvGrpSpPr>
        <p:cNvPr id="1" name=""/>
        <p:cNvGrpSpPr/>
        <p:nvPr/>
      </p:nvGrpSpPr>
      <p:grpSpPr>
        <a:xfrm>
          <a:off x="0" y="0"/>
          <a:ext cx="0" cy="0"/>
          <a:chOff x="0" y="0"/>
          <a:chExt cx="0" cy="0"/>
        </a:xfrm>
      </p:grpSpPr>
      <p:sp>
        <p:nvSpPr>
          <p:cNvPr id="2" name="Slide Image Placeholder"/>
          <p:cNvSpPr><a:spLocks noGrp="1"/></p:cNvSpPr>
          <p:nvPr><p:ph type="sldImg"/></p:nvPr>
        </p:nvSpPr>
        <p:spPr/>
      </p:sp>
      <p:sp>
        <p:nvSpPr>
          <p:cNvPr id="3" name="Notes Placeholder"/>
          <p:cNvSpPr><a:spLocks noGrp="1"/></p:cNvSpPr>
          <p:nvPr><p:ph type="body" idx="1"/></p:nvPr>
        </p:nvSpPr>
        <p:spPr/>
        <p:txBody>
          <a:bodyPr/>
          <a:lstStyle/>
          <a:p>
            <a:r>
              <a:rPr lang="en-US" smtClean="0"/>
              <a:t>${escaped}</a:t>
            </a:r>
            <a:endParaRPr lang="en-US"/>
          </a:p>
        </p:txBody>
      </p:sp>
    </p:shapeTree>
  </p:commonSlideData>
  <p:notesMasterIdList>
    <p:notesMasterId r:id="rId1"/>
  </p:notesMasterIdList>
</p:notes>`;
};

const ensureNotesRelationships = (zip: JSZip, slideCount: number) => {
  const relsPath = 'ppt/_rels/presentation.xml.rels';
  const relFile = zip.file(relsPath);
  if (relFile) {
    return; // Assume existing wiring for simplicity
  }
  const parts: string[] = [];
  for (let i = 1; i <= slideCount; i++) {
    parts.push(`<Relationship Id="rId_notes_${i}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/notesSlide" Target="notesSlides/notesSlide${i}.xml"/>`);
  }
  const content = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  ${parts.join('\n  ')}
</Relationships>`;
  zip.file(relsPath, content);
};

export async function embedNotesIntoPptx(inputPath: string, outputPath: string, payloads: SlideNotePayload[], locale: string = 'zh'): Promise<void> {
  const input = fs.readFileSync(inputPath);
  const zip = await JSZip.loadAsync(input instanceof Uint8Array ? input : new Uint8Array(input as ArrayBuffer));
  const slideFiles = Object.keys(zip.files)
    .filter(name => name.startsWith('ppt/slides/slide') && name.endsWith('.xml'))
    .sort((a, b) => {
      const numA = parseInt(a.match(/slide(\d+)\.xml/)?.[1] || '0');
      const numB = parseInt(b.match(/slide(\d+)\.xml/)?.[1] || '0');
      return numA - numB;
    });

  const serializerLang = LANG_MAP[locale] || 'zh-CN';

  // Ensure master exists
  if (!zip.file('ppt/notesMasters/notesMaster1.xml')) {
    zip.file('ppt/notesMasters/notesMaster1.xml', NOTES_MASTER_XML);
  }

  ensureNotesRelationships(zip, slideFiles.length);

  for (let i = 0; i < slideFiles.length; i++) {
    const slideIdx = i + 1;
    const payload = payloads[i];
    const noteText = payload?.notes ?? '';
    const notesPath = `ppt/notesSlides/notesSlide${slideIdx}.xml`;
    const generatedXml = createNotesSlideXML(slideIdx, noteText);
    zip.file(notesPath, generatedXml);

    const relsPath = `ppt/slides/_rels/slide${slideIdx}.xml.rels`;
    const relsFile = zip.file(relsPath);
    const relationXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rIdNotes${slideIdx}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/notesSlide" Target="../notesSlides/notesSlide${slideIdx}.xml"/>
</Relationships>`;
    zip.file(relsPath, relsFile ? await relsFile.async('string') : relationXml);

    const notesSlide = await zip.file(notesPath)?.async('string');
    if (notesSlide && serializerLang !== 'en-US') {
      const localized = notesSlide.replace(/lang="en-US"/g, `lang="${serializerLang}"`);
      zip.file(notesPath, localized);
    }
  }

  const outputBuffer = await zip.generateAsync({ type: 'uint8array' });
  const fd = fs.openSync(outputPath, fs.OpenMode.CREATE | fs.OpenMode.TRUNC | fs.OpenMode.WRONLY);
  fs.writeSync(fd, outputBuffer);
  fs.closeSync(fd);
}
