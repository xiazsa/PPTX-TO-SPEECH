import JSZip from 'jszip';
import { SlideData, TargetLanguage, ProcessingMode } from '../types';

// Map UI languages to ISO codes
const LANG_MAP: Record<TargetLanguage, string> = {
  'English': 'en-US',
  'Chinese': 'zh-CN',
  'Spanish': 'es-ES',
  'French': 'fr-FR',
  'German': 'de-DE',
  'Japanese': 'ja-JP',
  'Korean': 'ko-KR'
};

// --- XML TEMPLATES ---

const NOTES_MASTER_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:notesMaster xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
    <p:cSld>
        <p:bg><p:bgPr><a:solidFill><a:schemeClr val="lt1"/></a:solidFill></p:bgPr></p:bg>
        <p:spTree>
            <p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr>
            <p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr>
            <p:sp><p:nvSpPr><p:cNvPr id="2" name="Header Placeholder 1"/><p:cNvSpPr><a:spLocks noGrp="1"/></p:cNvSpPr><p:nvPr><p:ph type="hdr" sz="quarter"/></p:nvPr></p:nvSpPr><p:spPr/><p:txBody><a:bodyPr/><a:lstStyle/><a:p><a:endParaRPr/></a:p></p:txBody></p:sp>
            <p:sp><p:nvSpPr><p:cNvPr id="3" name="Date Placeholder 2"/><p:cNvSpPr><a:spLocks noGrp="1"/></p:cNvSpPr><p:nvPr><p:ph type="dt" sz="quarter" idx="1"/></p:nvPr></p:nvSpPr><p:spPr/><p:txBody><a:bodyPr/><a:lstStyle/><a:p><a:endParaRPr/></a:p></p:txBody></p:sp>
            <p:sp><p:nvSpPr><p:cNvPr id="4" name="Slide Image Placeholder 3"/><p:cNvSpPr><a:spLocks noGrp="1"/></p:cNvSpPr><p:nvPr><p:ph type="sldImg" idx="2"/></p:nvPr></p:nvSpPr><p:spPr/></p:sp>
            <p:sp><p:nvSpPr><p:cNvPr id="5" name="Body Placeholder 4"/><p:cNvSpPr><a:spLocks noGrp="1"/></p:cNvSpPr><p:nvPr><p:ph type="body" idx="3"/></p:nvPr></p:nvSpPr><p:spPr/><p:txBody><a:bodyPr/><a:lstStyle/><a:p><a:endParaRPr/></a:p></p:txBody></p:sp>
            <p:sp><p:nvSpPr><p:cNvPr id="6" name="Footer Placeholder 5"/><p:cNvSpPr><a:spLocks noGrp="1"/></p:cNvSpPr><p:nvPr><p:ph type="ftr" sz="quarter" idx="4"/></p:nvPr></p:nvSpPr><p:spPr/><p:txBody><a:bodyPr/><a:lstStyle/><a:p><a:endParaRPr/></a:p></p:txBody></p:sp>
            <p:sp><p:nvSpPr><p:cNvPr id="7" name="Slide Number Placeholder 6"/><p:cNvSpPr><a:spLocks noGrp="1"/></p:cNvSpPr><p:nvPr><p:ph type="sldNum" sz="quarter" idx="5"/></p:nvPr></p:nvSpPr><p:spPr/><p:txBody><a:bodyPr/><a:lstStyle/><a:p><a:fld id="{951B20C6-0CE6-4432-8438-65934C75F961}" type="slidenum"><a:rPr lang="en-US" smtClean="0"/><a:t>‹#›</a:t></a:fld><a:endParaRPr/></a:p></p:txBody></p:sp>
        </p:spTree>
    </p:cSld>
    <p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr>
</p:notesMaster>`;

// Helper to sanitize text for XML
const escapeXml = (unsafe: string) => {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
};

const extractTextFromXML = (xmlContent: string): string[] => {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlContent, "application/xml");
  const textNodes = xmlDoc.getElementsByTagName("a:t");
  const fallbackNodes = xmlDoc.getElementsByTagName("t");
  
  const nodes = textNodes.length > 0 ? textNodes : fallbackNodes;
  const texts: string[] = [];
  
  for (let i = 0; i < nodes.length; i++) {
    const text = nodes[i].textContent;
    if (text && text.trim().length > 0) {
      texts.push(text.trim());
    }
  }
  return texts;
};

// Helper to convert array buffer to base64
const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};

// Helper to get mime type from file extension
const getMimeType = (filename: string): string => {
  const ext = filename.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'png': return 'image/png';
    case 'jpg': 
    case 'jpeg': return 'image/jpeg';
    case 'gif': return 'image/gif';
    case 'webp': return 'image/webp';
    default: return 'image/jpeg';
  }
};

export interface ExtractedSlide {
    text: string[];
    images: string[];
}

export const parsePPTXFile = async (file: File, mode: ProcessingMode): Promise<ExtractedSlide[]> => {
  try {
    const zip = new JSZip();
    const zipped = await zip.loadAsync(file);
    const parser = new DOMParser();
    
    const fileNames = Object.keys(zipped.files).filter(name => 
      name.startsWith('ppt/slides/slide') && name.endsWith('.xml')
    );

    const sortedFileNames = fileNames.sort((a, b) => {
        const numA = parseInt(a.match(/slide(\d+)\.xml/)?.[1] || '0');
        const numB = parseInt(b.match(/slide(\d+)\.xml/)?.[1] || '0');
        return numA - numB;
    });

    const slidesData: ExtractedSlide[] = [];

    for (const fileName of sortedFileNames) {
      // 1. Text Extraction (Always do this as fallback or context)
      const content = await zipped.file(fileName)?.async('string');
      let texts: string[] = [];
      if (content) {
        texts = extractTextFromXML(content);
      }

      // 2. Image Extraction (Only if Vision mode is enabled)
      const images: string[] = [];
      if (mode === 'Vision') {
          // Find relationships file for this slide
          // e.g. ppt/slides/slide1.xml -> ppt/slides/_rels/slide1.xml.rels
          const slideName = fileName.split('/').pop(); // slide1.xml
          const relsPath = `ppt/slides/_rels/${slideName}.rels`;
          const relsFile = zipped.file(relsPath);

          if (relsFile) {
              const relsXml = await relsFile.async('string');
              const relsDoc = parser.parseFromString(relsXml, "application/xml");
              const relationships = relsDoc.getElementsByTagName("Relationship");

              for (let i = 0; i < relationships.length; i++) {
                  const type = relationships[i].getAttribute("Type");
                  const target = relationships[i].getAttribute("Target");
                  
                  // Check if relationship is an image
                  if (type && type.includes("/image") && target) {
                      // Resolve path. Targets are usually like "../media/image1.png"
                      let imagePath = target;
                      if (imagePath.startsWith('../')) {
                          imagePath = 'ppt' + imagePath.substring(2);
                      } else {
                          // Sometimes it's absolute or relative to ppt/slides
                          imagePath = 'ppt/slides/' + imagePath;
                      }

                      // Try to find the file
                      const imgFile = zipped.file(imagePath);
                      if (imgFile) {
                          const imgBuffer = await imgFile.async('arraybuffer');
                          const base64 = arrayBufferToBase64(imgBuffer);
                          const mime = getMimeType(imagePath);
                          // For simplicity in the app, we store as full data URI
                          images.push(`data:${mime};base64,${base64}`);
                      }
                  }
              }
          }
      }

      slidesData.push({ text: texts, images });
    }

    return slidesData;
  } catch (error) {
    console.error("Failed to parse PPTX:", error);
    throw new Error("Invalid PPTX file or encrypted.");
  }
};

/**
 * Robustly embeds scripts by creating necessary notes structures if they are missing.
 */
export const embedScriptsAndExportPPTX = async (
  originalFile: File, 
  slides: SlideData[],
  targetLanguage: TargetLanguage = 'Chinese'
): Promise<Blob> => {
  try {
    const zip = new JSZip();
    const zipped = await zip.loadAsync(originalFile);
    const parser = new DOMParser();
    const serializer = new XMLSerializer();
    const isoLang = LANG_MAP[targetLanguage] || 'zh-CN';

    // 1. Identify slide files
    const slideFiles = Object.keys(zipped.files).filter(name => 
      name.startsWith('ppt/slides/slide') && name.endsWith('.xml')
    ).sort((a, b) => {
        const numA = parseInt(a.match(/slide(\d+)\.xml/)?.[1] || '0');
        const numB = parseInt(b.match(/slide(\d+)\.xml/)?.[1] || '0');
        return numA - numB;
    });

    // 2. Ensure Notes Master exists
    if (!zipped.file('ppt/notesMasters/notesMaster1.xml')) {
        zipped.file('ppt/notesMasters/notesMaster1.xml', NOTES_MASTER_XML);
    }
    
    // Ensure Notes Master Relationship (linking to theme)
    // We assume theme1.xml exists in a standard PPTX.
    if (!zipped.file('ppt/notesMasters/_rels/notesMaster1.xml.rels')) {
        const notesMasterRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
    <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme" Target="../theme/theme1.xml"/>
</Relationships>`;
        zipped.file('ppt/notesMasters/_rels/notesMaster1.xml.rels', notesMasterRels);
    }

    // 3. Update Content_Types.xml
    const ctFile = zipped.file('[Content_Types].xml');
    if (ctFile) {
        let ctXml = await ctFile.async('string');
        const ctDoc = parser.parseFromString(ctXml, "application/xml");
        const types = ctDoc.getElementsByTagName("Types")[0];

        // Ensure NotesMaster override exists
        if (!ctXml.includes('/ppt/notesMasters/notesMaster1.xml')) {
            const masterOverride = ctDoc.createElement("Override");
            masterOverride.setAttribute("PartName", "/ppt/notesMasters/notesMaster1.xml");
            masterOverride.setAttribute("ContentType", "application/vnd.openxmlformats-officedocument.presentationml.notesMaster+xml");
            types.appendChild(masterOverride);
        }

        // 4. Process Slides
        for (let i = 0; i < slides.length; i++) {
            const slideData = slides[i];
            
            // We ensure we match the slide file
            if (i >= slideFiles.length) continue;

            const slideFileName = slideFiles[i]; // ppt/slides/slide1.xml
            const slideNumberMatch = slideFileName.match(/slide(\d+)\.xml/);
            const slideIndexStr = slideNumberMatch ? slideNumberMatch[1] : `${i + 1}`;
            
            const noteFileName = `notesSlide${slideIndexStr}.xml`;
            const notePath = `ppt/notesSlides/${noteFileName}`;
            const noteRelPath = `ppt/notesSlides/_rels/${noteFileName}.rels`;
            
            // A. Generate Paragraph XML from Script
            // Handle script or empty script (to ensure structure exists)
            const scriptContent = slideData.generatedScript || "";
            const lines = scriptContent.split('\n');
            const paragraphsXml = lines.map(line => {
                // Use template literals for cleaner XML generation
                return `
                <a:p>
                    <a:r>
                        <a:rPr lang="${isoLang}" altLang="en-US"/>
                        <a:t>${escapeXml(line)}</a:t>
                    </a:r>
                    <a:endParaRPr lang="${isoLang}" altLang="en-US"/>
                </a:p>`;
            }).join('');

            // B. Construct the Full Notes XML
            const noteXmlContent = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:notes xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
    <p:cSld>
        <p:spTree>
            <p:sp>
                <p:nvSpPr><p:cNvPr id="2" name="Slide Image Placeholder 1"/><p:cNvSpPr><a:spLocks noGrp="1"/></p:cNvSpPr><p:nvPr><p:ph type="sldImg" idx="2"/></p:nvPr></p:nvSpPr>
                <p:spPr/>
            </p:sp>
            <p:sp>
                <p:nvSpPr><p:cNvPr id="3" name="Notes Text Placeholder 2"/><p:cNvSpPr><a:spLocks noGrp="1"/></p:cNvSpPr><p:nvPr><p:ph type="body" idx="3"/></p:nvPr></p:nvSpPr>
                <p:spPr/>
                <p:txBody>
                    <a:bodyPr/>
                    ${paragraphsXml}
                </p:txBody>
            </p:sp>
        </p:spTree>
    </p:cSld>
    <p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr>
</p:notes>`;

            zipped.file(notePath, noteXmlContent);

            // C. Create Relationships for the Note Slide
            const noteRelContent = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
    <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/notesMaster" Target="../notesMasters/notesMaster1.xml"/>
    <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="../slides/slide${slideIndexStr}.xml"/>
</Relationships>`;
            zipped.file(noteRelPath, noteRelContent);

            // D. Link the Original Slide to this Note Slide
            const slideRelPath = `ppt/slides/_rels/slide${slideIndexStr}.xml.rels`;
            let slideRelXml = "";
            const existingSlideRel = zipped.file(slideRelPath);
            
            if (existingSlideRel) {
                slideRelXml = await existingSlideRel.async('string');
            } else {
                slideRelXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"></Relationships>`;
            }
            
            const slideRelDoc = parser.parseFromString(slideRelXml, "application/xml");
            const relsRoot = slideRelDoc.getElementsByTagName("Relationships")[0];
            
            // Check if relationship already exists
            const existingRels = Array.from(relsRoot.getElementsByTagName("Relationship"));
            let noteRelId = null;
            
            for (const rel of existingRels) {
                if (rel.getAttribute("Type")?.endsWith("/notesSlide")) {
                    rel.setAttribute("Target", `../notesSlides/${noteFileName}`);
                    noteRelId = rel.getAttribute("Id");
                    break;
                }
            }

            if (!noteRelId) {
                let maxId = 0;
                existingRels.forEach(rel => {
                    const idVal = rel.getAttribute("Id");
                    if (idVal && idVal.startsWith("rId")) {
                        const num = parseInt(idVal.substring(3));
                        if (!isNaN(num) && num > maxId) maxId = num;
                    }
                });
                noteRelId = `rId${maxId + 1}`;
                
                const newRel = slideRelDoc.createElement("Relationship");
                newRel.setAttribute("Id", noteRelId);
                newRel.setAttribute("Type", "http://schemas.openxmlformats.org/officeDocument/2006/relationships/notesSlide");
                newRel.setAttribute("Target", `../notesSlides/${noteFileName}`);
                relsRoot.appendChild(newRel);
            }
            
            zipped.file(slideRelPath, serializer.serializeToString(slideRelDoc));

            // E. Add Override to Content Types
            const ctCheck = `/ppt/notesSlides/${noteFileName}`;
            if (!ctXml.includes(ctCheck)) {
                 const override = ctDoc.createElement("Override");
                 override.setAttribute("PartName", ctCheck);
                 override.setAttribute("ContentType", "application/vnd.openxmlformats-officedocument.presentationml.notesSlide+xml");
                 types.appendChild(override);
                 // Update internal string tracker to avoid dupes in this loop
                 ctXml += ctCheck; 
            }
        }

        zipped.file('[Content_Types].xml', serializer.serializeToString(ctDoc));
    }

    return await zipped.generateAsync({ 
        type: "blob",
        mimeType: "application/vnd.openxmlformats-officedocument.presentationml.presentation"
    });

  } catch (error) {
    console.error("Failed to embed scripts:", error);
    throw new Error("Could not create PPTX file.");
  }
};