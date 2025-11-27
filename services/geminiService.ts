import { GoogleGenAI } from "@google/genai";
import { TargetLanguage, ScriptStyle } from "../types";

let genAIClient: GoogleGenAI | null = null;

export const initializeGemini = (apiKey: string) => {
  genAIClient = new GoogleGenAI({ apiKey });
};

// Helper for exponential backoff retry
const retry = async <T>(fn: () => Promise<T>, retries = 3, delay = 1000): Promise<T> => {
  try {
    return await fn();
  } catch (error) {
    if (retries <= 0) throw error;
    console.warn(`API call failed, retrying... (${retries} attempts left)`);
    await new Promise(resolve => setTimeout(resolve, delay));
    return retry(fn, retries - 1, delay * 2);
  }
};

const getStyleGuidelines = (style: ScriptStyle, customPrompt: string): string => {
  switch (style) {
    case 'Conversational':
      return "Tone: Relaxed, engaging, and spoken-word style. Use 'we', 'us', and rhetorical questions. Avoid overly dense jargon. Make it sound like a TED talk.";
    case 'Academic':
      return "Tone: Formal, objective, and detailed. Focus on accuracy, citations (if implied), and logical structure. Use precise vocabulary suitable for a lecture.";
    case 'Enthusiastic':
      return "Tone: High-energy, motivational, and persuasive. Use strong verbs and punchy sentences. Focus on the 'wow' factor and benefits.";
    case 'Humorous':
      return "Tone: Light-hearted and witty. Include an appropriate joke or playful observation related to the content if possible. Keep it professional but fun.";
    case 'Custom':
      return `Tone: CUSTOM USER REQUIREMENT. Follow this instruction strictly: "${customPrompt}".`;
    case 'Professional':
    default:
      return "Tone: Formal, concise, and business-oriented. Direct and confident. Suitable for a corporate boardroom.";
  }
};

const formatImagePart = (base64Uri: string) => {
    const matches = base64Uri.match(/^data:(.+);base64,(.+)$/);
    if (matches) {
        return {
            inlineData: {
                mimeType: matches[1],
                data: matches[2]
            }
        };
    }
    return null;
};

export const generateSlideScript = async (
  slideIndex: number,
  totalSlides: number,
  currentSlideContent: string[],
  currentSlideImages: string[], // Base64 strings
  previousSlideImages: string[] | null,
  nextSlideImages: string[] | null,
  previousScript: string | null,
  nextSlideContent: string[] | null,
  language: TargetLanguage = 'English',
  style: ScriptStyle = 'Professional',
  customPrompt: string = ''
): Promise<string> => {
  if (!genAIClient) {
    throw new Error("Gemini API not initialized");
  }

  // 1. Sanitize text content
  const cleanContent = currentSlideContent
    .map(t => t.trim())
    .filter(t => t.length > 1);

  const textContext = cleanContent.length > 0 
    ? cleanContent.join("\n- ").slice(0, 5000)
    : "(No extractable text found. Rely on visual analysis.)";

  // 2. Prepare Text Contexts
  const prevContext = previousScript 
    ? `PREVIOUSLY SPOKEN (Recap for continuity):
"""
${previousScript.slice(-1000)} 
"""` 
    : "This is the OPENING slide. Start strong.";

  const nextTextContext = nextSlideContent && nextSlideContent.length > 0
    ? `NEXT SLIDE TEXT PREVIEW:
"""
${nextSlideContent.join(', ').slice(0, 300)}...
"""`
    : "This is the FINAL slide.";

  const styleGuidelines = getStyleGuidelines(style, customPrompt);

  const systemInstruction = `
    You are an expert presentation speaker delivering a cohesive, continuous speech.
    
    Current Progress: Slide ${slideIndex + 1} of ${totalSlides}.
    Target Language: ${language}
    Selected Style: ${style}
    
    CONTEXT:
    ${prevContext}
    ${nextTextContext}
    
    CURRENT SLIDE TEXT DATA:
    - ${textContext}

    GUIDELINES:
    1. STRICTLY write the script in ${language}.
    2. **FLOW IS CRITICAL**: Explicitly connect this slide to the previous one (visuals or text) and foreshadow the next one.
    3. Use transitional phrases (e.g., "As we saw in the previous chart...", "Moving on to...", "This leads us to...").
    4. **VISUAL ANALYSIS**: You are provided with images of the Previous (if any), Current, and Next (if any) slides.
       - Refer to visual elements in the CURRENT slide (charts, photos, diagrams) specifically.
       - If the Previous slide had a related visual, mention the progression.
    5. **STYLE INSTRUCTION**: ${styleGuidelines}
    6. Length: Approx 150-250 words.
    7. Return ONLY the raw script text.
  `;

  // 3. Construct Payload with Interleaved Images
  const parts: any[] = [];
  
  // A. Previous Slide Context (Visual)
  if (previousSlideImages && previousSlideImages.length > 0) {
      parts.push({ text: "CONTEXT - VISUAL FROM PREVIOUS SLIDE (For continuity):" });
      const imgPart = formatImagePart(previousSlideImages[0]); // Take first image
      if (imgPart) parts.push(imgPart);
  }

  // B. Current Slide Visuals
  if (currentSlideImages.length > 0) {
      parts.push({ text: "FOCUS - VISUAL CONTENT OF CURRENT SLIDE (Describe and Analyze this):" });
      // Limit to 1 main image for current slide to save tokens if heavy, but usually fine
      const imgPart = formatImagePart(currentSlideImages[0]);
      if (imgPart) parts.push(imgPart);
  }

  // C. Next Slide Preview (Visual)
  if (nextSlideImages && nextSlideImages.length > 0) {
      parts.push({ text: "PREVIEW - VISUAL FROM NEXT SLIDE (For transition/foreshadowing):" });
      const imgPart = formatImagePart(nextSlideImages[0]);
      if (imgPart) parts.push(imgPart);
  }

  // D. System Instructions
  parts.push({ text: systemInstruction });

  try {
    const responseText = await retry(async () => {
      const response = await genAIClient!.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts },
      });
      return response.text;
    });
    
    return responseText || "Could not generate script (Empty response).";

  } catch (error: any) {
    console.error(`Gemini API Error on Slide ${slideIndex + 1}:`, error);
    const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
    throw new Error(`API Failure: ${errorMessage}`);
  }
};