export type PromptExample = {
  label: string;
  prompt: string;
  notes: string;
  negativePrompt?: string;
};

export type PromptPage = {
  slug: string;
  title: string;
  metaDescription: string;
  intro: string;
  toolSlug: string;
  examples: PromptExample[];
  tips: string[];
  faq: { question: string; answer: string }[];
  lastReviewed: string;
  relatedSlugs: string[];
};

const sharedTips = [
  "Start with subject, setting, style, lighting, and composition before adding model parameters.",
  "Keep text out of the generated image when readability matters; add final typography in a design tool.",
  "Generate rough variations first, then refine the strongest composition with more specific constraints.",
  "Use negative prompts to remove blur, watermarks, random text, distorted anatomy, and clutter.",
  "Save winning prompts with the source tool, aspect ratio, model version, and final edit notes."
];

export const promptPages: PromptPage[] = [
  {
    slug: "midjourney-prompts",
    title: "Midjourney Prompts and Examples",
    metaDescription: "Copy practical Midjourney prompts for product shots, creator thumbnails, editorial covers, and SaaS visuals.",
    intro: "Use these Midjourney prompt examples when you need high-aesthetic concepts before spending time on final design. Each prompt includes a concrete subject, style direction, lighting, composition, and parameter intent.",
    toolSlug: "midjourney-prompt-generator",
    lastReviewed: "2026-06-12",
    relatedSlugs: ["image-prompts", "stable-diffusion-prompts", "product-photo-prompts"],
    examples: [
      {
        label: "SaaS hero workstation",
        prompt: "solo founder working at a clean walnut desk, floating translucent workflow cards around a laptop screen, cinematic realism, dramatic side lighting, shallow depth of field, premium startup editorial photo, calm green and graphite palette --ar 16:9 --stylize 250 --quality 1",
        notes: "Good for a homepage hero where the product should feel practical and focused."
      },
      {
        label: "AI coding cover",
        prompt: "developer debugging code in a dark but tidy studio, large monitor showing abstract code shapes, strong rim light, high contrast tech editorial, realistic hands, no readable UI text, confident atmosphere --ar 16:9 --stylize 180 --quality 1",
        notes: "Use for coding guides, tool comparisons, and launch posts."
      },
      {
        label: "Premium product desk",
        prompt: "wireless earbuds case on a graphite desk beside a ceramic coffee cup, premium product photography, studio lighting, crisp reflections, clean background, commercial advertising style, subtle depth of field --ar 3:2 --stylize 120 --quality 1",
        notes: "Works as a product concept before moving into ecommerce-specific prompts."
      },
      {
        label: "Editorial AI portrait",
        prompt: "thoughtful product manager reviewing AI-generated notes on paper cards, editorial magazine cover style, natural daylight, warm office background, realistic skin texture, quiet confidence, generous copy space on the left --ar 4:5 --stylize 200",
        notes: "Useful for blog-less guide pages, LinkedIn headers, and editorial thumbnails."
      },
      {
        label: "Minimal prompt poster",
        prompt: "minimalist poster design about better AI prompts, one crisp abstract cursor mark, clean composition, generous whitespace, refined typography area left blank, muted off-white background, teal accent, premium design system aesthetic --ar 4:5 --stylize 150",
        notes: "Leaves room for manual typography after generation."
      },
      {
        label: "Creator thumbnail scene",
        prompt: "creator pointing at a wall of floating thumbnail concepts, energetic creator thumbnail, vibrant colors, high contrast, strong focal point, title-safe space on right side, expressive but credible face, modern studio background --ar 16:9 --stylize 250",
        notes: "Use as visual exploration before adding final YouTube text in Canva or Figma."
      },
      {
        label: "Research paper explainer",
        prompt: "researcher annotating a dense paper with colored tabs, cinematic realism, clean desk, soft morning light, shallow depth of field, organized notes, subtle AI interface reflections, no readable text --ar 16:9 --stylize 160",
        notes: "Good for document and research workflow pages."
      },
      {
        label: "Futuristic utility tool",
        prompt: "small utility dashboard transforming messy copied text into clean structured output, high-end 3D render, realistic materials, soft shadows, detailed geometry, floating before-and-after panels, off-white studio background --ar 16:9 --stylize 120",
        notes: "A safe generic visual for utility tools without showing real user data."
      },
      {
        label: "Product launch concept",
        prompt: "premium AI workspace product launch scene, laptop on marble surface, green light accents, clear focal point, balanced composition, professional color grading, modern founder tools arranged neatly, high resolution --ar 16:9 --stylize 220",
        notes: "Useful for launch pages and announcement graphics."
      },
      {
        label: "Notebook planning scene",
        prompt: "open notebook with neatly arranged prompt blocks, natural daylight, organic paper texture, warm atmosphere, lifestyle photography, clean pen, laptop blurred in background, practical creator workflow mood --ar 3:2 --stylize 130",
        notes: "Good for prompt library and workflow education visuals."
      }
    ],
    tips: [
      ...sharedTips,
      "Use `--ar` first to lock composition, then vary `--stylize` for taste.",
      "Keep Midjourney prompts concise; stack the strongest nouns and visual modifiers instead of long instructions."
    ],
    faq: [
      {
        question: "What makes a good Midjourney prompt?",
        answer: "A good Midjourney prompt names the subject, visual style, lighting, composition, aspect ratio, and any constraints that affect the final use."
      },
      {
        question: "Should I include text in a Midjourney prompt?",
        answer: "Avoid relying on generated text for final assets. Leave title-safe space, then add readable text in a design tool."
      },
      {
        question: "How many prompt variations should I generate?",
        answer: "Start with two to four broad variations, pick the strongest composition, then refine style intensity and details."
      },
      {
        question: "Can these prompts be used commercially?",
        answer: "Review your Midjourney plan, brand rights, likeness rights, and final asset use before commercial publishing."
      }
    ]
  },
  {
    slug: "stable-diffusion-prompts",
    title: "Stable Diffusion Prompts and Negative Prompts",
    metaDescription: "Copy SDXL and Stable Diffusion prompts with positive prompts, negative prompts, and practical control notes.",
    intro: "Use these Stable Diffusion prompts when you need more control over style, negative prompts, product visuals, and local image workflows. The examples are written for SDXL-style prompt packages.",
    toolSlug: "stable-diffusion-prompt-generator",
    lastReviewed: "2026-06-12",
    relatedSlugs: ["image-prompts", "midjourney-prompts", "product-photo-prompts"],
    examples: [
      {
        label: "White running shoe",
        prompt: "white running shoe on a matte stone platform, photorealistic, high detail, realistic materials, professional lighting, commercial product photography, sharp focus, subtle reflection, clean gray background",
        negativePrompt: "low quality, blurry, watermark, bad logo, distorted sole, extra laces, unreadable text, harsh shadow",
        notes: "Start with product shape and lighting before adding brand-specific references."
      },
      {
        label: "Anime character sheet",
        prompt: "young explorer character sheet, high quality anime illustration, expressive character design, clean line art, vibrant colors, front view and three-quarter view, simple neutral background",
        negativePrompt: "bad anatomy, extra fingers, distorted face, blurry, watermark, cropped head, messy line art",
        notes: "Useful for concept work before commissioning final character art."
      },
      {
        label: "3D app icon",
        prompt: "3D render of a polished task board icon, realistic materials, detailed geometry, soft studio light, rounded square base, teal and graphite accents, clean app store presentation",
        negativePrompt: "flat screenshot, text, watermark, jagged edges, noisy background, low resolution",
        notes: "Use for early icon exploration, then refine in a design tool."
      },
      {
        label: "Minimal poster",
        prompt: "poster design for an AI prompt workshop, strong graphic composition, bold visual hierarchy, abstract cursor symbol, off-white background, teal accent, large empty typography area",
        negativePrompt: "random letters, clutter, busy background, blurry shapes, watermark, low contrast",
        notes: "Add real event text manually after generation."
      },
      {
        label: "Editorial workspace",
        prompt: "photorealistic editorial photo of a clean AI workspace, laptop, paper notes, index cards, warm side light, detailed textures, calm professional composition, shallow depth of field",
        negativePrompt: "messy cables, unreadable screen text, distorted laptop, extra hands, watermark, oversaturated colors",
        notes: "Good generic image for workflow and productivity pages."
      },
      {
        label: "Product mockup scene",
        prompt: "premium bottle mockup on beige stone, photorealistic, high detail, realistic materials, commercial lighting, soft shadow, shallow depth of field, space for label design",
        negativePrompt: "fake brand text, warped bottle, blurry label, bad reflection, noisy background",
        notes: "Keep label areas blank unless a controlled reference workflow is available."
      },
      {
        label: "Tech dashboard render",
        prompt: "high-end 3D render of an analytics dashboard made of floating glass panels, realistic materials, soft shadows, detailed geometry, dark graphite background, teal highlights",
        negativePrompt: "random UI text, cluttered panels, low quality, jagged shapes, watermark",
        notes: "Useful for abstract SaaS visuals without exposing real product data."
      },
      {
        label: "Natural skincare photo",
        prompt: "natural skincare serum bottle with green leaves and soft daylight, fresh natural daylight, organic texture, warm atmosphere, lifestyle photography, clean premium composition",
        negativePrompt: "fake text, dirty bottle, harsh flash, distorted cap, watermark, clutter",
        notes: "Use for brand direction before exact packaging shots."
      },
      {
        label: "Creator studio portrait",
        prompt: "photorealistic creator in a tidy studio holding a blank thumbnail board, bold educational thumbnail style, high contrast, strong focal point, title-safe space, expressive but realistic",
        negativePrompt: "unreadable text, distorted hand, extra fingers, blurry face, watermark, messy background",
        notes: "Prepare the image first, then add final thumbnail typography."
      },
      {
        label: "Holiday campaign object",
        prompt: "holiday campaign visual for a premium coffee subscription box, celebratory composition, warm studio lighting, elegant ribbon, clean product hero shot, commercial advertising style",
        negativePrompt: "random text, cheap plastic look, cluttered props, bad packaging, watermark",
        notes: "Works as a seasonal creative direction starter."
      }
    ],
    tips: [
      ...sharedTips,
      "Keep the positive prompt focused on what should appear, and the negative prompt focused on common failure modes.",
      "Record checkpoint, sampler, CFG, seed, and size when you find a reusable result."
    ],
    faq: [
      {
        question: "What is a Stable Diffusion negative prompt?",
        answer: "A negative prompt lists artifacts and unwanted traits the model should avoid, such as blur, watermark, random text, or distorted anatomy."
      },
      {
        question: "Are these prompts only for SDXL?",
        answer: "They are SDXL-friendly, but you can adapt them to other Stable Diffusion checkpoints by changing style terms and parameters."
      },
      {
        question: "Should I use ControlNet or references?",
        answer: "Use references when exact pose, product shape, or layout matters. Plain text prompts are better for broad exploration."
      },
      {
        question: "Why do product prompts need manual review?",
        answer: "Generated images can distort product geometry, labels, and legal claims, so commercial assets need brand and rights review."
      }
    ]
  },
  {
    slug: "product-photo-prompts",
    title: "AI Product Photo Prompts for Ecommerce",
    metaDescription: "Copy product photo prompts for ecommerce hero shots, landing pages, ads, and seasonal campaigns.",
    intro: "Use these AI product photo prompts to prepare commercial image concepts before a paid generation pass. They focus on buyer context, lighting, materials, background, and headline-safe composition.",
    toolSlug: "product-photo-prompt-generator",
    lastReviewed: "2026-06-12",
    relatedSlugs: ["image-prompts", "stable-diffusion-prompts", "youtube-thumbnail-prompts"],
    examples: [
      {
        label: "Skincare hero image",
        prompt: "premium vitamin C serum bottle for urban women ages 25-35, premium luxury visual, refined materials, elegant lighting, high-end commercial photography, translucent amber bottle, marble surface, soft glow, space for headline",
        negativePrompt: "fake label text, distorted bottle, harsh glare, cluttered props, watermark",
        notes: "Keep the label area clean unless using a controlled reference image."
      },
      {
        label: "Desk lamp ecommerce",
        prompt: "minimalist desk lamp for remote workers, fresh natural daylight, organic texture, warm home office background, commercial product photography, clean hero composition, subtle shadow, visible material detail",
        negativePrompt: "warped lamp neck, messy desk, unreadable text, overexposed background, watermark",
        notes: "Good for Shopify hero sections and product category pages."
      },
      {
        label: "Wireless earbuds ad",
        prompt: "wireless earbuds case for commuters, premium product photography, studio lighting, clean background, crisp reflections, graphite surface, subtle motion trail, commercial advertising style, title-safe space",
        negativePrompt: "extra earbuds, distorted case, random logo, blurry edges, clutter",
        notes: "Works for paid ad concepts and landing page above-the-fold visuals."
      },
      {
        label: "Reusable water bottle",
        prompt: "insulated reusable water bottle for hikers, fresh natural daylight, outdoor trail stone, condensation detail, realistic metal texture, clean hero composition, premium active lifestyle mood",
        negativePrompt: "fake brand text, dented bottle, muddy background, distorted cap, watermark",
        notes: "Use natural context without hiding the product shape."
      },
      {
        label: "SaaS device mockup",
        prompt: "tablet displaying an abstract task dashboard for product teams, futuristic technology aesthetic, sleek surfaces, cool lighting, clean gradients, premium product photography, no readable UI text, space for headline",
        negativePrompt: "random screen text, distorted tablet, cluttered office, low resolution",
        notes: "Use abstract UI shapes to avoid fake product claims."
      },
      {
        label: "Coffee subscription box",
        prompt: "premium coffee subscription box for home brewers, warm morning kitchen light, ceramic mug, roasted beans, refined packaging area, commercial product photography, clean background, cozy but premium mood",
        negativePrompt: "misspelled packaging text, messy crumbs, distorted box, watermark",
        notes: "Keep packaging text blank for manual design."
      },
      {
        label: "Fitness watch launch",
        prompt: "fitness smartwatch for busy professionals, tech aesthetic, sleek black watch, cool rim lighting, subtle biometric glow, clean studio background, crisp reflection, headline-safe composition",
        negativePrompt: "wrong time text, warped screen, extra straps, unreadable UI, watermark",
        notes: "Add actual UI details in post-production."
      },
      {
        label: "Holiday candle campaign",
        prompt: "scented candle gift set for holiday shoppers, holiday campaign visual, celebratory composition, premium promotional style, warm studio lighting, elegant ribbon, soft bokeh, clean product hero shot",
        negativePrompt: "cheap plastic look, random text, cluttered ornaments, distorted jar, watermark",
        notes: "Seasonal prompts should still keep the product as the focal point."
      },
      {
        label: "Pet product image",
        prompt: "modern ceramic pet bowl for apartment dog owners, natural lifestyle photography, warm kitchen floor, clean composition, subtle paw detail, realistic ceramic texture, product centered with gentle shadow",
        negativePrompt: "messy food, distorted bowl, extra animal limbs, watermark, unreadable label",
        notes: "Use lifestyle context without making the scene busy."
      },
      {
        label: "B2B notebook bundle",
        prompt: "premium notebook and pen bundle for consultants, editorial product photography, soft daylight, textured paper, clean desk, balanced composition, space for headline, refined professional mood",
        negativePrompt: "fake handwritten text, clutter, bent notebook, harsh shadow, watermark",
        notes: "Works for lead magnets, B2B offers, and brand kits."
      }
    ],
    tips: [
      ...sharedTips,
      "Name the buyer and product use case so the image feels commercial, not generic.",
      "Leave label and packaging text blank unless you use a controlled reference workflow."
    ],
    faq: [
      {
        question: "Can AI product photos replace real product photography?",
        answer: "They can help concept and test creative direction, but final commercial images need product accuracy, brand review, and legal review."
      },
      {
        question: "What should every product photo prompt include?",
        answer: "Include product, target buyer, material, setting, lighting, composition, and anything that must stay blank for manual editing."
      },
      {
        question: "How do I avoid fake labels in AI product images?",
        answer: "Ask for blank label areas or no readable text, then add real typography and claims in a design tool."
      },
      {
        question: "Which image tools work with these prompts?",
        answer: "Use them as starting points for Midjourney, Stable Diffusion, Gemini, DALL-E, and other image models, then tune syntax per model."
      }
    ]
  },
  {
    slug: "youtube-thumbnail-prompts",
    title: "YouTube Thumbnail Prompts and Examples",
    metaDescription: "Copy YouTube thumbnail prompts with focal subjects, contrast plans, title-safe areas, and creator styles.",
    intro: "Use these YouTube thumbnail prompts to plan the visual hook before generating or designing the thumbnail. They focus on focal point, expression, contrast, background, and title-safe space.",
    toolSlug: "youtube-thumbnail-prompt-generator",
    lastReviewed: "2026-06-12",
    relatedSlugs: ["image-prompts", "product-photo-prompts", "ai-video-prompts"],
    examples: [
      {
        label: "AI tools ranking",
        prompt: "YouTube thumbnail background for: I tested 10 AI tools for freelancers, bold educational thumbnail, high contrast, strong focal point, creator holding three floating app cards, title-safe space on left side, expressive but credible, modern desk setup",
        negativePrompt: "random readable text, distorted face, extra fingers, cluttered app logos, watermark",
        notes: "Add the final headline manually so text stays sharp."
      },
      {
        label: "Coding tutorial",
        prompt: "YouTube thumbnail background for: Fix Next.js build errors faster, cinematic tech style, developer pointing at a glowing error panel, dark clean studio, high contrast teal accent, title-safe area on right, focused expression",
        negativePrompt: "real code text, broken hands, messy monitors, low contrast, watermark",
        notes: "Use abstract error panels rather than fake code."
      },
      {
        label: "Productivity challenge",
        prompt: "YouTube thumbnail background for: I planned a week in 15 minutes, energetic creator thumbnail, vibrant colors, timer visual, neat task cards, expressive surprise, title-safe space, clean modern home office",
        negativePrompt: "random numbers, unreadable calendar text, distorted clock, clutter",
        notes: "Strong for before-and-after productivity videos."
      },
      {
        label: "Startup story",
        prompt: "YouTube thumbnail background for: Building a tiny SaaS in one weekend, minimal premium thumbnail style, founder at laptop, progress bars as abstract shapes, warm light, clear focal point, title-safe area",
        negativePrompt: "fake UI text, messy desk, extra hands, watermark",
        notes: "Keeps the scene credible for founder-led videos."
      },
      {
        label: "Document workflow",
        prompt: "YouTube thumbnail background for: I summarized a 90-page PDF with AI, bold educational style, large document stack, glowing summary card, expressive relief, clean desk, high contrast, text-safe space",
        negativePrompt: "readable fake document text, distorted papers, clutter, watermark",
        notes: "Fits PDF, research, and meeting-summary workflows."
      },
      {
        label: "Image prompt tutorial",
        prompt: "YouTube thumbnail background for: Better AI images start with better prompts, cinematic creator studio, floating image prompt blocks, before-and-after image panels, strong focal point, teal accent, title-safe space",
        negativePrompt: "random letters, bad thumbnails inside thumbnails, clutter, distorted hands",
        notes: "Use for prompt education and image-generation tutorials."
      },
      {
        label: "Tool comparison",
        prompt: "YouTube thumbnail background for: ChatGPT vs Gemini for real work, split-screen visual with two abstract assistant workspaces, high contrast, neutral comparison mood, creator in center, title-safe space",
        negativePrompt: "brand logos, fake UI text, distorted face, watermark",
        notes: "Avoid using trademarked logos unless rights and policies are clear."
      },
      {
        label: "Creator workflow",
        prompt: "YouTube thumbnail background for: Turn one idea into five shorts, energetic creator thumbnail, idea card exploding into vertical video frames, vibrant colors, strong focal point, clean title-safe area",
        negativePrompt: "messy frames, unreadable text, extra fingers, watermark",
        notes: "Great for repurposing and creator-lab content."
      },
      {
        label: "AI cost warning",
        prompt: "YouTube thumbnail background for: Stop wasting AI credits, bold educational thumbnail, creator holding a credit meter, red warning accent, clean dashboard shapes, high contrast, title-safe space",
        negativePrompt: "fake numbers, cluttered warning signs, distorted hands, watermark",
        notes: "Works for cost-control and workflow planning videos."
      },
      {
        label: "Research explainer",
        prompt: "YouTube thumbnail background for: Explain any research paper with AI, premium educational style, paper pages turning into simple diagram blocks, focused researcher, soft light, clear focal point, title-safe area",
        negativePrompt: "readable fake paper text, cluttered formulas, distorted face, watermark",
        notes: "Use diagrams as abstract shapes, then add text manually."
      }
    ],
    tips: [
      ...sharedTips,
      "Plan the thumbnail with the video title; the image and title should not repeat the exact same information.",
      "Reserve a title-safe area and add the final text in a design tool for readability."
    ],
    faq: [
      {
        question: "What should a YouTube thumbnail prompt include?",
        answer: "Include the video promise, focal subject, emotion, contrast plan, composition, and title-safe area."
      },
      {
        question: "Should thumbnail text be generated by AI?",
        answer: "Usually no. Generate the background and subject, then add crisp readable text in Canva, Figma, or Photoshop."
      },
      {
        question: "How do I make a thumbnail less cluttered?",
        answer: "Use one focal subject, one visual conflict, and one title-safe area instead of multiple competing objects."
      },
      {
        question: "Can these prompts improve click-through rate?",
        answer: "They can improve creative clarity, but CTR depends on title, audience, topic, and testing with real viewers."
      }
    ]
  },
  {
    slug: "ai-video-prompts",
    title: "AI Video Prompts for Short Product Clips",
    metaDescription: "Copy AI video prompts for product reveals, app teasers, creator intros, b-roll, and short-form ads.",
    intro: "Use these AI video prompts to define scene, subject motion, camera movement, duration, and quality constraints before spending video-generation credits.",
    toolSlug: "video-prompt-generator",
    lastReviewed: "2026-06-12",
    relatedSlugs: ["image-prompts", "youtube-thumbnail-prompts", "product-photo-prompts"],
    examples: [
      {
        label: "SaaS dashboard reveal",
        prompt: "A SaaS dashboard turns messy notes into a clean task board. Duration: 8s. Camera movement: slow push-in. Cinematic lighting, realistic motion, coherent screen shapes, natural depth of field, no random text, no flicker, hold on the final organized board.",
        notes: "Use abstract UI shapes unless you have a real screen capture workflow."
      },
      {
        label: "Smartwatch product orbit",
        prompt: "A black smartwatch floats above a matte desk while subtle health notification lights orbit the screen. Duration: 8s. Camera movement: orbit shot. Premium product lighting, crisp metal texture, stable object geometry, no unreadable screen text.",
        notes: "Good for product teaser concepts before final editing."
      },
      {
        label: "Coffee pour b-roll",
        prompt: "Fresh coffee pours into a ceramic mug beside an open planning notebook. Duration: 5s. Camera movement: slow push-in. Warm morning light, natural steam, shallow depth of field, smooth liquid motion, cozy creator workflow mood.",
        notes: "Useful as creator b-roll or newsletter visual direction."
      },
      {
        label: "AI prompt cards",
        prompt: "Paper prompt cards rearrange themselves into a neat checklist on a clean desk. Duration: 8s. Camera movement: top-down. Soft daylight, realistic paper motion, clear sequence, no readable text, calm productivity mood.",
        notes: "A practical visual for prompt tutorials without fake UI."
      },
      {
        label: "Thumbnail concept wall",
        prompt: "A creator studies a wall of blank thumbnail frames that light up one by one. Duration: 8s. Camera movement: handheld documentary. High contrast studio lighting, expressive but natural movement, title-safe blank panels, no random text.",
        notes: "Pairs well with YouTube thumbnail prompt content."
      },
      {
        label: "Product photo setup",
        prompt: "A skincare bottle settles onto a marble platform as soft studio lights switch on. Duration: 5s. Camera movement: slow push-in. Premium commercial product photography, crisp reflection, stable bottle shape, blank label area.",
        notes: "Keep label text blank for manual finishing."
      },
      {
        label: "Debugging workflow",
        prompt: "A dark code workspace transforms from red error blocks into a clean green checklist. Duration: 8s. Camera movement: slow push-in. Futuristic technology aesthetic, no readable code, smooth transition, no flicker, clear before-and-after story.",
        notes: "Works for developer tool explainers."
      },
      {
        label: "Research summary",
        prompt: "A stack of research papers becomes three simple diagram cards on a desk. Duration: 8s. Camera movement: top-down. Editorial lighting, realistic paper motion, clean organization, no readable paper text, final hold on summary cards.",
        notes: "Good for document workflow and paper explainer pages."
      },
      {
        label: "Launch teaser",
        prompt: "A premium AI workspace opens on a laptop while subtle task cards slide into place around it. Duration: 15s. Camera movement: orbit shot. Sleek tech aesthetic, calm motion, realistic screen glow, no random UI text.",
        notes: "Use for a product launch teaser before adding real captions."
      },
      {
        label: "Short-form hook",
        prompt: "A creator snaps fingers and one rough idea card becomes five vertical video frames. Duration: 5s. Camera movement: handheld documentary. Energetic creator style, clean studio background, vibrant but controlled colors, no random text.",
        notes: "Strong for Shorts, Reels, and TikTok ideation."
      }
    ],
    tips: [
      ...sharedTips,
      "Write video prompts as shots, not posters: subject action, camera motion, duration, and ending frame matter.",
      "Reserve post-production for captions, UI details, product claims, and exact brand elements."
    ],
    faq: [
      {
        question: "What makes an AI video prompt work?",
        answer: "A useful video prompt defines the scene, subject motion, camera movement, duration, pacing, and what should not appear."
      },
      {
        question: "Should I include exact UI text in video prompts?",
        answer: "Avoid exact text in generated footage. Add captions, UI, and product claims in post-production."
      },
      {
        question: "How long should the first AI video test be?",
        answer: "Start with five to eight seconds so you can validate motion and composition before paying for longer generations."
      },
      {
        question: "Can one prompt work across all video models?",
        answer: "The structure can transfer, but each provider may need different syntax, duration limits, and retry strategy."
      }
    ]
  },
  {
    slug: "image-prompts",
    title: "AI Image Prompts and Copy-Ready Examples",
    metaDescription: "Copy AI image prompts for marketing visuals, creator assets, product concepts, thumbnails, and SaaS pages.",
    intro: "Use this general AI image prompt library when you need model-ready visual language before choosing Midjourney, Stable Diffusion, Gemini, DALL-E, or another image tool.",
    toolSlug: "image-prompt-generator",
    lastReviewed: "2026-06-12",
    relatedSlugs: ["midjourney-prompts", "stable-diffusion-prompts", "product-photo-prompts"],
    examples: [
      {
        label: "SaaS homepage hero",
        prompt: "a premium AI workspace on a clean desk, cinematic realism, dramatic lighting, shallow depth of field, high dynamic range, detailed textures, floating workflow cards, calm teal accent, balanced composition, headline-safe space",
        negativePrompt: "low quality, blurry, watermark, distorted UI, unreadable text, cluttered desk",
        notes: "Use for startup and software landing pages."
      },
      {
        label: "Prompt workshop visual",
        prompt: "open notebook with structured prompt blocks, minimalist poster design, clean composition, generous whitespace, refined typography area, off-white paper texture, green accent, practical educational mood",
        negativePrompt: "random letters, messy handwriting, clutter, watermark, low contrast",
        notes: "Good for prompt education and library pages."
      },
      {
        label: "Creator toolkit",
        prompt: "creator desk with microphone, thumbnail sketches, laptop, and prompt cards, natural daylight, organic texture, warm atmosphere, lifestyle photography, clean focal point, modern creator workflow",
        negativePrompt: "messy cables, unreadable screen text, extra hands, watermark",
        notes: "Works across YouTube, newsletter, and creator workflow pages."
      },
      {
        label: "Developer utility visual",
        prompt: "developer utility dashboard cleaning JSON and regex snippets, futuristic technology aesthetic, sleek surfaces, cool lighting, clean gradients, abstract code blocks, no readable private data, professional composition",
        negativePrompt: "real secrets, random code text, cluttered panels, low quality, watermark",
        notes: "Use abstract data blocks to avoid exposing sensitive examples."
      },
      {
        label: "Document summary scene",
        prompt: "long document stack transformed into concise summary cards, editorial photography, soft daylight, clean desk, paper texture, clear focal point, balanced composition, professional work mood",
        negativePrompt: "readable confidential text, messy papers, watermark, distorted hands",
        notes: "Good for PDF summary and research workflows."
      },
      {
        label: "Product ad concept",
        prompt: "premium headphones on a graphite surface, product photography, studio lighting, clean background, crisp reflections, commercial advertising style, subtle shadow, space for headline",
        negativePrompt: "fake logo, distorted product shape, harsh glare, clutter, watermark",
        notes: "A general product prompt before using product-specific templates."
      },
      {
        label: "Minimal social card",
        prompt: "minimal social media card about AI tools for real work, minimalist poster design, generous whitespace, one abstract tool mark, refined layout area, muted off-white background, teal accent",
        negativePrompt: "random text, busy icons, blurry shapes, watermark",
        notes: "Add final title and copy in a design tool."
      },
      {
        label: "Research explainer image",
        prompt: "researcher turning dense paper notes into simple diagram cards, cinematic realism, balanced composition, soft side light, professional color grading, no readable paper text, clear focal point",
        negativePrompt: "cluttered formulas, distorted face, unreadable text, watermark",
        notes: "Useful for long-document and technical explainer content."
      },
      {
        label: "AI comparison visual",
        prompt: "two abstract AI workstations side by side with a neutral comparison table in the center, clean composition, professional color grading, high resolution, no brand logos, balanced lighting",
        negativePrompt: "fake logos, random UI text, cluttered layout, low quality",
        notes: "Safe for comparison pages without implying affiliation."
      },
      {
        label: "Utility transformation",
        prompt: "messy copied text transforming into clean structured output cards, high-end 3D render, realistic materials, soft shadows, detailed geometry, off-white background, calm productivity mood",
        negativePrompt: "readable private text, random letters, clutter, jagged shapes, watermark",
        notes: "Works for small utility tools and cleanup workflows."
      }
    ],
    tips: [
      ...sharedTips,
      "Write a general prompt first, then convert it into Midjourney or Stable Diffusion syntax if the model needs parameters.",
      "Use platform-specific pages when you need aspect ratios, negative prompts, or thumbnail-safe layout rules."
    ],
    faq: [
      {
        question: "What is an AI image prompt?",
        answer: "An AI image prompt is a structured description of the subject, style, lighting, composition, constraints, and output goal for an image model."
      },
      {
        question: "Can one image prompt work in every model?",
        answer: "The idea can transfer, but Midjourney, Stable Diffusion, Gemini, and other tools often need different syntax and parameters."
      },
      {
        question: "Should I use negative prompts?",
        answer: "Use negative prompts when the tool supports them, especially to reduce blur, watermarks, random text, distorted anatomy, and clutter."
      },
      {
        question: "How should I finish AI-generated images?",
        answer: "Use a design tool for typography, brand assets, product claims, accessibility checks, and final export sizing."
      }
    ]
  }
];

export function getPromptPage(slug: string): PromptPage | undefined {
  return promptPages.find((page) => page.slug === slug);
}
