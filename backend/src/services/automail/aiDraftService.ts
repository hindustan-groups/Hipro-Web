import { getBrandMetadata } from "./emailTemplateWrapper";

export interface AiDraftInput {
  prompt: string;
  mode?: "compose" | "reply";
  brand?: string;
  tone?: "professional" | "friendly" | "formal" | "urgent";
  incomingSubject?: string;
  incomingBody?: string;
  incomingFromName?: string;
  recipientName?: string;
}

export interface AiDraftOutput {
  subject: string;
  bodyText: string;
  bodyHtml: string;
  provider: "gemini" | "smart_engine";
}

function buildSmartFallbackDraft(input: AiDraftInput): AiDraftOutput {
  const meta = getBrandMetadata(input.brand);
  const prompt = (input.prompt || "").trim();
  const lower = prompt.toLowerCase();
  const recipient = (input.recipientName || input.incomingFromName || "{{name}}").trim() || "{{name}}";
  const isReply = input.mode === "reply";

  let subject = input.incomingSubject
    ? input.incomingSubject.toLowerCase().startsWith("re:")
      ? input.incomingSubject
      : `Re: ${input.incomingSubject}`
    : `Update from ${meta.brandTitle}`;

  let paragraphs: string[] = [];

  if (lower.includes("waterproof") || lower.includes("seepage") || lower.includes("leak") || lower.includes("crack") || meta.brandKey === "hbs") {
    if (!isReply) subject = `Waterproofing & Structural Care Proposal — ${meta.brandTitle}`;
    paragraphs = [
      `Dear ${recipient},`,
      `Thank you for connecting with ${meta.brandTitle} (HiBUILD Structural Care Division).`,
      prompt
        ? `Regarding your requirement (${prompt}), our technical engineering team recommends a thermal moisture inspection followed by our German polymer waterproofing treatment backed by a 5–10 year written warranty.`
        : `Our technical engineering team has reviewed your requirement and can schedule an on-site moisture inspection to provide an itemized BOQ and warranty-backed solution.`,
      `Please let us know a convenient date and time for our senior engineer to visit your site, or call us directly at ${meta.helplinePhone}.`,
    ];
  } else if (lower.includes("tender") || lower.includes("kyc") || lower.includes("vendor") || lower.includes("empanel") || lower.includes("gate") || meta.brandKey === "empanelment") {
    if (!isReply) subject = `Procurement & Empanelment Desk Update — Hindustan Projects`;
    paragraphs = [
      `Dear ${recipient},`,
      `Greetings from the Hindustan Projects Vendor Empanelment & Procurement Directorate.`,
      prompt
        ? `With reference to: ${prompt} — our procurement review team is coordinating the next steps on your vendor profile and active work packages.`
        : `Your vendor profile and documentation are under active review with our Central Procurement Desk. You can track live status and tender notices anytime via ${meta.websiteDisplay}.`,
      `For urgent tender or gate-pass assistance, please reply to this email or contact ${meta.helplinePhone}.`,
    ];
  } else if (lower.includes("quote") || lower.includes("estimate") || lower.includes("cost") || lower.includes("rate") || lower.includes("boq")) {
    if (!isReply) subject = `Detailed Quotation & Cost Estimate — ${meta.brandTitle}`;
    paragraphs = [
      `Dear ${recipient},`,
      `Thank you for reaching out to ${meta.brandTitle} for your upcoming civil and turnkey construction requirement.`,
      prompt
        ? `As requested (${prompt}), we are preparing a transparent, item-wise BOQ and execution timeline tailored to your site specifications.`
        : `We have prepared the preliminary project estimate and material specifications for your review.`,
      `We would be glad to walk you through the commercial proposal on a quick call or site meeting. Feel free to reply here or reach us at ${meta.helplinePhone}.`,
    ];
  } else if (lower.includes("visit") || lower.includes("inspect") || lower.includes("meeting") || lower.includes("call") || lower.includes("site")) {
    if (!isReply) subject = `Site Inspection & Engineering Consultation — ${meta.brandTitle}`;
    paragraphs = [
      `Dear ${recipient},`,
      `Thank you for your inquiry with ${meta.brandTitle}.`,
      prompt
        ? `Confirming the schedule regarding: ${prompt}. Our civil engineering team will coordinate with you ahead of arrival to review site drawings and measurements.`
        : `Our senior project engineer is available to visit your site for technical measurements and consultation.`,
      `Please confirm your preferred slot and site location so we can finalize the visit.`,
    ];
  } else {
    if (!isReply && prompt) {
      subject = `${meta.brandTitle}: ${prompt.slice(0, 60)}${prompt.length > 60 ? "..." : ""}`;
    }
    paragraphs = [
      `Dear ${recipient},`,
      isReply
        ? `Thank you for your email. We have received your message and noted all details.`
        : `Greetings from ${meta.brandTitle}.`,
      prompt
        ? `${prompt.charAt(0).toUpperCase() + prompt.slice(1)}. Our dedicated engineering and client desk is ready to assist you with complete transparency and timely execution.`
        : `We are writing to share an official update regarding your project inquiry with ${meta.brandTitle}.`,
      `Please feel free to reply directly to this email or reach our helpline at ${meta.helplinePhone}.`,
    ];
  }

  const signOff = `Warm Regards,\n${meta.brandTitle} Desk\n${meta.contactEmail} | ${meta.helplinePhone}`;
  const bodyText = [...paragraphs, signOff].join("\n\n");
  const bodyHtml = paragraphs
    .map((p) => `<p style="margin: 0 0 14px; color: #1e293b; font-size: 14px; line-height: 1.65;">${p}</p>`)
    .join("\n") +
    `\n<p style="margin: 18px 0 0; color: #475569; font-size: 13px; line-height: 1.6;">Warm Regards,<br/><strong style="color: #0f172a;">${meta.brandTitle} Desk</strong><br/>${meta.contactEmail} &bull; ${meta.helplinePhone}</p>`;

  return {
    subject,
    bodyText,
    bodyHtml,
    provider: "smart_engine",
  };
}

/**
 * Draft a professional email or reply using Gemini API when configured,
 * falling back to the domain-tuned Smart Corporate Engine so it never fails.
 */
export async function generateAiEmailDraft(input: AiDraftInput): Promise<AiDraftOutput> {
  const apiKey = (process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY || "").trim();
  const meta = getBrandMetadata(input.brand);

  if (!apiKey) {
    return buildSmartFallbackDraft(input);
  }

  try {
    const systemPrompt = [
      `You are the executive communications assistant for ${meta.brandTitle} (${meta.divisionLabel}).`,
      `Website: ${meta.websiteUrl}, Contact Email: ${meta.contactEmail}, Helpline: ${meta.helplinePhone}.`,
      `Write a concise, clear, high-trust business email ${input.mode === "reply" ? "reply" : "message"} in ${input.tone || "professional"} tone.`,
      `If the user's instruction is in Hinglish/Hindi, understand the intent and write polished professional English (unless Hindi is explicitly requested).`,
      `Return ONLY valid JSON with keys: "subject" (string) and "bodyText" (plain text paragraphs separated by double newlines, no markdown fences).`,
    ].join(" ");

    const userContext = [
      `Instruction: ${input.prompt || "Write a polite professional follow-up"}`,
      input.recipientName ? `Recipient Name: ${input.recipientName}` : "",
      input.incomingSubject ? `Replying to Subject: ${input.incomingSubject}` : "",
      input.incomingBody ? `Incoming Email Snippet: ${input.incomingBody.slice(0, 700)}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    const resp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: `${systemPrompt}\n\n${userContext}` }],
            },
          ],
          generationConfig: {
            temperature: 0.5,
            responseMimeType: "application/json",
          },
        }),
      }
    );

    if (!resp.ok) {
      return buildSmartFallbackDraft(input);
    }

    const data: any = await resp.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const parsed = JSON.parse(rawText);
    const bodyText = String(parsed.bodyText || "").trim();
    const subject = String(parsed.subject || input.incomingSubject || `Update from ${meta.brandTitle}`).trim();

    if (!bodyText) {
      return buildSmartFallbackDraft(input);
    }

    const bodyHtml = bodyText
      .split(/\n{2,}/)
      .map(
        (para) =>
          `<p style="margin: 0 0 14px; color: #1e293b; font-size: 14px; line-height: 1.65;">${para
            .trim()
            .replace(/\n/g, "<br />")}</p>`
      )
      .join("\n");

    return {
      subject,
      bodyText,
      bodyHtml,
      provider: "gemini",
    };
  } catch {
    return buildSmartFallbackDraft(input);
  }
}
