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

export const generateSlideScript = async (
  slideIndex: number,
  totalSlides: number,
  currentSlideContent: string[],
  previousScript: string | null,
  nextSlideContent: string[] | null,
  language: TargetLanguage = 'English',
  style: ScriptStyle = 'Professional',
  customPrompt: string = ''
): Promise<string> => {
  if (!genAIClient) {
    throw new Error("Gemini API not initialized");
  }

  // 1. Sanitize content
  const cleanContent = currentSlideContent
    .map(t => t.trim())
    .filter(t => t.length > 1);

  // Allow generation even if empty to provide a bridge between slides, 
  // but warn the AI it's an image-only or empty slide.
  const contentContext = cleanContent.length > 0 
    ? cleanContent.join("\n- ").slice(0, 10000)
    : "(This slide contains mainly visuals or no extractable text. Focus on transitioning from the previous topic.)";

  // 2. Prepare Contexts
  const prevContext = previousScript 
    ? `PREVIOUSLY SPOKEN (The script you just generated for the previous slide):
"""
${previousScript.slice(-2000)} 
"""
(Instruction: You must smoothly transition from the end of the above text to the current slide.)` 
    : "This is the OPENING slide. Start with a strong introduction.";

  const nextContext = nextSlideContent && nextSlideContent.length > 0
    ? `NEXT SLIDE PREVIEW (What comes immediately after):
"""
${nextSlideContent.join(', ').slice(0, 500)}...
"""
(Instruction: End this current script by briefly hinting at or leading into this next topic.)`
    : "This is the FINAL slide. Conclude the presentation effectively.";

  const styleGuidelines = getStyleGuidelines(style, customPrompt);

  const prompt = `
    You are an expert presentation speechwriter delivering a cohesive, single continuous speech.
    
    Current Progress: Slide ${slideIndex + 1} of ${totalSlides}.
    Target Language: ${language}
    Selected Style: ${style}
    
    CONTEXT:
    ${prevContext}
    
    CURRENT SLIDE DATA:
    - ${contentContext}
    
    ${nextContext}

    GUIDELINES:
    1. STRICTLY write the script in ${language}.
    2. **FLOW IS CRITICAL**: Do not treat this as an isolated slide. Connect it explicitly to what was just said in the "PREVIOUSLY SPOKEN" block.
    3. Use transitional phrases (e.g., "Building on that...", "Now let's look at...", "As we saw earlier...").
    4. Expand on the bullet points provided in "CURRENT SLIDE DATA". Do not just read them aloud.
    5. **STYLE INSTRUCTION**: ${styleGuidelines}
    6. Length: Approx 150-250 words.
    7. Return ONLY the raw script text. No titles, no markdown metadata.
  `;

  try {
    // 3. Execute with retry logic
    const responseText = await retry(async () => {
      const response = await genAIClient!.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
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
