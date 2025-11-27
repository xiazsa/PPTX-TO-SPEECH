import * as pdfjsLib from 'pdfjs-dist';

// Initialize the worker
// Note: In a typical bundler setup, we'd import the worker. 
// Here we point to the CDN version that matches the library version in index.html
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://aistudiocdn.com/pdfjs-dist@4.0.379/build/pdf.worker.min.mjs';

export const convertPdfToImages = async (file: File): Promise<string[]> => {
  const arrayBuffer = await file.arrayBuffer();
  
  // Load the document
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const pageCount = pdf.numPages;
  const images: string[] = [];

  for (let i = 1; i <= pageCount; i++) {
    const page = await pdf.getPage(i);
    
    // Set scale for quality (1.5 is usually good for analysis without being too huge)
    const viewport = page.getViewport({ scale: 1.5 });
    
    // Create a canvas to render the page
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    if (!context) {
      throw new Error('Could not create canvas context');
    }

    canvas.height = viewport.height;
    canvas.width = viewport.width;

    // Render PDF page into canvas context
    await page.render({
      canvasContext: context,
      viewport: viewport
    }).promise;

    // Convert canvas to Data URL (Base64)
    // JPEG is usually smaller and fine for analysis
    const base64 = canvas.toDataURL('image/jpeg', 0.8);
    images.push(base64);
  }

  return images;
};