import { UILanguage } from '../types';

export const TRANSLATIONS = {
  English: {
    appTitle: "AutoScript AI",
    apiKeyModal: {
      title: "Enter Gemini API Key",
      desc: "To generate scripts, this app requires a Google Gemini API key. Your key is used locally and never stored on our servers.",
      placeholder: "AIzaSy...",
      submit: "Start Session",
      link: "Get an API Key"
    },
    landing: {
      heroTitle: "Turn Slides into Speeches",
      heroTitleGradient: "Instantly.",
      heroDesc: "The intelligent assistant that analyzes your PowerPoint visually and textually to generate professional speaker notes in seconds. Powered by Google Gemini 2.5.",
      startBtn: "Start Creating",
      learnMore: "Learn How It Works",
      features: {
        visual: {
          title: "Vision Analysis",
          desc: "Understands charts, diagrams, and photos in your slides for context-aware scripts."
        },
        style: {
          title: "Adaptive Tone",
          desc: "Choose from Professional, Humorous, or Custom styles to match your audience."
        },
        export: {
          title: "Native Export",
          desc: "Injects generated notes directly back into your .pptx file automatically."
        }
      }
    },
    header: {
      textOnly: "Text Only",
      exportPPTX: "Export PPTX",
      mode: "Mode"
    },
    uploadZone: {
      settingsTitle: "Generation Settings",
      analysisMode: "Analysis Mode",
      modeText: "Standard Text",
      modeVision: "Vision (PPT + PDF)",
      visionDelay: "Generation Interval (Rate Limit Control)",
      visionHint: "Increase delay if you experience AI rate limit errors.",
      modeDescText: "Fast. Extracts text from PPTX XML. Best for standard text-heavy slides.",
      modeDescVision: "Advanced. Upload PPTX for structure + PDF for visual analysis. Sends slide images to AI for context-aware scripts.",
      targetLang: "Target Language",
      style: "Speaking Style",
      styleDesc: {
        Professional: "Formal, concise, corporate tone",
        Conversational: "Relaxed, engaging, spoken-word style",
        Academic: "Detailed, educational, formal vocabulary",
        Enthusiastic: "High energy, motivational, persuasive",
        Humorous: "Light-hearted, witty, occasional jokes",
        Custom: "Define your own specific requirements"
      },
      advanced: "Advanced",
      customInst: "Custom Instructions",
      customPlaceholder: "e.g., 'Make it sound like a Steve Jobs keynote', 'Focus heavily on the financial data'...",
      dropPPTX: "Upload PowerPoint (.pptx)",
      dropHint: "Drag & drop or click to upload",
      step1: "Step 1: Structure",
      step1Desc: "Upload the .pptx file",
      step2: "Step 2: Visuals",
      step2Desc: "Upload PDF export of slides",
      change: "Change",
      startVision: "Start Vision Analysis",
      errorPPTX: "Please upload a .pptx file.",
      errorPDF: "Please upload a .pdf file.",
      errorBoth: "Both PPTX and PDF files are required for Vision Mode."
    },
    editor: {
      slidesOverview: "Slides Overview",
      slide: "Slide",
      noContent: "No Content",
      visualContent: "Visual Content",
      editorTitle: "Speaker Notes Editor",
      regenerate: "Regenerate AI",
      analyzedContent: "Analyzed Content",
      extractedVisuals: "Extracted Visuals",
      textData: "Text Data",
      noExtractedText: "No extracted text.",
      script: "Script",
      waiting: "Waiting for AI generation...",
      writing: "Writing script...",
      prevSlide: "Previous Slide",
      nextSlide: "Next Slide"
    },
    processing: {
      analyzing: "Analyzing Presentation Structure...",
      extracting: "Extracting content...",
      rendering: "Rendering PDF Slides...",
      parsing: "Parsing XML Text..."
    }
  },
  Chinese: {
    appTitle: "AutoScript AI 智能讲稿",
    apiKeyModal: {
      title: "输入 Gemini API 密钥",
      desc: "本应用需要 Google Gemini API 密钥来生成讲稿。您的密钥仅在本地使用，不会存储在我们的服务器上。",
      placeholder: "AIzaSy...",
      submit: "开始会话",
      link: "获取 API 密钥"
    },
    landing: {
      heroTitle: "让 PPT 自动开口说话",
      heroTitleGradient: "瞬间完成",
      heroDesc: "智能助手，深度分析幻灯片的视觉与文字内容，秒级生成专业演讲备注。由 Google Gemini 2.5 驱动。",
      startBtn: "立即开始",
      learnMore: "了解工作原理",
      features: {
        visual: {
          title: "视觉感知",
          desc: "能够理解图表、插图和照片，生成与画面紧密结合的讲稿内容。"
        },
        style: {
          title: "多变风格",
          desc: "提供专业、幽默或完全自定义的演讲风格，完美契合您的听众。"
        },
        export: {
          title: "原生导出",
          desc: "将生成的讲稿直接无缝写回 PPTX 文件的备注栏，一键下载。"
        }
      }
    },
    header: {
      textOnly: "纯文本下载",
      exportPPTX: "导出 PPTX",
      mode: "模式"
    },
    uploadZone: {
      settingsTitle: "生成设置",
      analysisMode: "分析模式",
      modeText: "标准文本",
      modeVision: "视觉模式 (PPT + PDF)",
      visionDelay: "生成间隔 (频率限制控制)",
      visionHint: "如果遇到 AI 频率限制错误，请增加延迟。",
      modeDescText: "快速。从 PPTX XML 提取文本。最适合标准文字为主的幻灯片。",
      modeDescVision: "高级。上传 PPTX 获取结构 + PDF 进行视觉分析。将幻灯片图像发送给 AI 以生成具有上下文意识的讲稿。",
      targetLang: "目标语言",
      style: "演讲风格",
      styleDesc: {
        Professional: "正式、简洁、企业语气",
        Conversational: "轻松、引人入胜、口语化风格",
        Academic: "详细、教育性、正式词汇",
        Enthusiastic: "高能量、激励性、有说服力",
        Humorous: "轻松、风趣、偶尔开玩笑",
        Custom: "定义您自己的具体要求"
      },
      advanced: "高级",
      customInst: "自定义指令",
      customPlaceholder: "例如：'像乔布斯的演讲一样'，'重点关注财务数据'...",
      dropPPTX: "上传 PowerPoint (.pptx)",
      dropHint: "拖放或点击上传",
      step1: "第一步：结构",
      step1Desc: "上传 .pptx 文件",
      step2: "第二步：视觉",
      step2Desc: "上传幻灯片的 PDF 导出文件",
      change: "更改",
      startVision: "开始视觉分析",
      errorPPTX: "请上传 .pptx 文件。",
      errorPDF: "请上传 .pdf 文件。",
      errorBoth: "视觉模式需要同时上传 PPTX 和 PDF 文件。"
    },
    editor: {
      slidesOverview: "幻灯片概览",
      slide: "幻灯片",
      noContent: "无内容",
      visualContent: "视觉内容",
      editorTitle: "演讲备注编辑器",
      regenerate: "AI 重新生成",
      analyzedContent: "已分析内容",
      extractedVisuals: "提取的视觉图像",
      textData: "文本数据",
      noExtractedText: "未提取到文本。",
      script: "讲稿",
      waiting: "等待 AI 生成...",
      writing: "正在撰写讲稿...",
      prevSlide: "上一页",
      nextSlide: "下一页"
    },
    processing: {
      analyzing: "正在分析演示文稿结构...",
      extracting: "正在提取内容...",
      rendering: "正在渲染 PDF 幻灯片...",
      parsing: "正在解析 XML 文本..."
    }
  }
};