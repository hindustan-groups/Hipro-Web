import React from 'react';
import type { BlogPost, FaqItem, InternalLink, BlogCtaConfig } from './types';

export type { FaqItem, InternalLink, BlogCtaConfig };

export interface MarkdownBlock {
  type: 'h1' | 'h2' | 'h3' | 'paragraph' | 'ul' | 'ol' | 'blockquote' | 'table' | 'image';
  content?: string;
  items?: string[];
  headers?: string[];
  rows?: string[][];
}

/**
 * Safely parses a JSON string with fallback, ensuring malformed JSON never crashes public pages.
 */
export function safeJsonParse<T>(raw: string | undefined | null, fallback: T): T {
  if (!raw || typeof raw !== 'string') return fallback;
  const trimmed = raw.trim();
  if (!trimmed) return fallback;
  try {
    return JSON.parse(trimmed) as T;
  } catch {
    return fallback;
  }
}

/**
 * Resolves FAQ items for a blog post:
 * 1. Prioritizes structured `post.faqs` JSON array if valid and non-empty.
 * 2. Falls back to markdown regex extraction `extractFaqsFromMarkdown` if structured FAQs are missing.
 * Never throws on malformed JSON.
 */
export function getFaqs(post: Partial<BlogPost> | null | undefined): FaqItem[] {
  if (!post) return [];

  // 1. Structured JSON FAQs
  if (post.faqs) {
    const parsed = safeJsonParse<any[]>(post.faqs, []);
    if (Array.isArray(parsed)) {
      const valid = parsed
        .filter(item => item && typeof item === 'object' && typeof item.question === 'string' && typeof item.answer === 'string')
        .map(item => ({
          question: item.question.trim(),
          answer: item.answer.trim(),
        }))
        .filter(item => item.question.length > 0 && item.answer.length > 0);
      if (valid.length > 0) {
        return valid;
      }
    }
  }

  // 2. Fallback to markdown extraction
  return extractFaqsFromMarkdown(post.content || '');
}

/**
 * Safely parses structured internal links for a post.
 */
export function getInternalLinks(post: Partial<BlogPost> | null | undefined): InternalLink[] {
  if (!post || !post.internalLinks) return [];
  const parsed = safeJsonParse<any[]>(post.internalLinks, []);
  if (!Array.isArray(parsed)) return [];
  return parsed
    .filter(item => item && typeof item === 'object' && typeof item.label === 'string' && typeof item.url === 'string')
    .map(item => ({
      label: item.label.trim(),
      url: item.url.trim(),
    }))
    .filter(item => item.label.length > 0 && item.url.length > 0);
}

/**
 * Safely parses custom CTA config for a post.
 */
export function getCustomCta(post: Partial<BlogPost> | null | undefined): BlogCtaConfig | null {
  if (!post || !post.customCta) return null;
  const parsed = safeJsonParse<any>(post.customCta, null);
  if (!parsed || typeof parsed !== 'object') return null;
  if (!parsed.title || typeof parsed.title !== 'string') return null;
  if (!parsed.buttonText || typeof parsed.buttonText !== 'string') return null;
  if (!parsed.buttonUrl || typeof parsed.buttonUrl !== 'string') return null;

  return {
    title: parsed.title.trim(),
    description: typeof parsed.description === 'string' ? parsed.description.trim() : undefined,
    buttonText: parsed.buttonText.trim(),
    buttonUrl: parsed.buttonUrl.trim(),
  };
}

/**
 * Safely parses curated related post IDs/slugs.
 */
export function getRelatedPostIds(post: Partial<BlogPost> | null | undefined): string[] {
  if (!post || !post.relatedPostIds) return [];
  const parsed = safeJsonParse<any[]>(post.relatedPostIds, []);
  if (!Array.isArray(parsed)) return [];
  return parsed
    .filter(id => typeof id === 'string' && id.trim().length > 0)
    .map(id => String(id).trim());
}

/**
 * Strips leading '# Title' if present (to avoid duplicate H1 when Hero already displays H1)
 * and conservatively adds at most 1-2 natural, highly contextual service links where appropriate.
 */
export function enrichBlogContent(slug: string, rawContent: string): string {
  if (!rawContent) return "";

  // 1. Remove duplicate leading H1 markdown (# Title)
  let content = rawContent.replace(/^#\s+[^\n]+\n+/, '');

  // Count existing internal links
  const existingInternalLinks = (content.match(/\]\(\/(services|cost-estimator|contact|projects)/g) || []).length;
  if (existingInternalLinks >= 2) {
    // Already has 2 or more contextual links, do not add more
    return content;
  }

  let linksAdded = existingInternalLinks;

  // Backward-compatibility: preserve existing high-value anchors on the foundational Rajasthan guide
  if (slug === 'house-construction-cost-in-rajasthan-a-complete-guide-for-2026') {
    if (linksAdded < 2 && !content.includes('/services/architecture-planning')) {
      content = content.replace(
        'A well-designed house can help you use your available space efficiently while avoiding unnecessary construction costs.',
        'A well-designed house can help you use your available space efficiently while avoiding unnecessary construction costs. Coordinating comprehensive [architectural planning and structural engineering](/services/architecture-planning) ensures drawings account for circulation, regional climate, and structural integrity.'
      );
      linksAdded++;
    }

    if (linksAdded < 2 && !content.includes('/cost-estimator')) {
      content = content.replace(
        'A useful way to begin estimating your budget is:',
        'A convenient way to begin estimating your budget is using an online [construction cost estimator](/cost-estimator) or applying the standard area calculation:'
      );
      linksAdded++;
    }

    return content;
  }

  // Conservative, non-intrusive contextual linking for other articles (maximum 1-2 total)
  if (linksAdded < 2 && !content.includes('/services/architecture-planning') && /architectural planning|floor plan design/i.test(content)) {
    content = content.replace(
      /(architectural planning|floor plan design)/i,
      '[$1](/services/architecture-planning)'
    );
    linksAdded++;
  }

  if (linksAdded < 2 && !content.includes('/services/professional-construction-services') && /turnkey construction|civil construction/i.test(content)) {
    content = content.replace(
      /(turnkey construction|civil construction)/i,
      '[$1](/services/professional-construction-services)'
    );
    linksAdded++;
  }

  if (linksAdded < 2 && !content.includes('/cost-estimator') && /cost estimator|construction cost calculator/i.test(content)) {
    content = content.replace(
      /(cost estimator|construction cost calculator)/i,
      '[$1](/cost-estimator)'
    );
    linksAdded++;
  }

  return content;
}

/**
 * Extracts FAQ questions and answers from a blog markdown string
 * for automatic Schema.org FAQPage JSON-LD generation.
 */
export function extractFaqsFromMarkdown(content: string): FaqItem[] {
  if (!content) return [];

  const faqs: FaqItem[] = [];
  const faqSectionMatch = content.match(/##\s+(?:Frequently Asked Questions|FAQs|FAQ)([\s\S]*?)(?=\n##\s+|$)/i);
  
  if (!faqSectionMatch || !faqSectionMatch[1]) {
    return [];
  }

  const faqText = faqSectionMatch[1];
  const questionBlocks = faqText.split(/\n###\s+/).filter(Boolean);

  for (const block of questionBlocks) {
    const lines = block.trim().split('\n').filter(l => l.trim().length > 0);
    if (lines.length >= 2) {
      const question = lines[0].replace(/^#+\s*/, '').trim();
      const answer = lines.slice(1).join(' ').trim().replace(/\*\*/g, '');
      if (question && answer) {
        faqs.push({ question, answer });
      }
    }
  }

  return faqs;
}

function parseTableRow(line: string): string[] {
  let trimmed = line.trim();
  if (trimmed.startsWith('|')) trimmed = trimmed.slice(1);
  if (trimmed.endsWith('|')) trimmed = trimmed.slice(0, -1);
  return trimmed.split('|').map(c => c.trim());
}

/**
 * Robust markdown block parser that cleanly separates:
 * - H1, H2, H3
 * - Standalone Images (![alt](url))
 * - Bulleted (unordered) lists
 * - Numbered (ordered) lists
 * - Blockquotes
 * - Tables (preserving empty cells)
 * - Standard paragraphs
 */
export function parseMarkdownBlocks(content: string): MarkdownBlock[] {
  if (!content) return [];

  const rawBlocks = content.split(/\n{2,}/);
  const blocks: MarkdownBlock[] = [];

  for (const rawBlock of rawBlocks) {
    const trimmed = rawBlock.trim();
    if (!trimmed) continue;

    // Check Standalone Image: ![alt](url)
    const imgMatch = trimmed.match(/^!\[([^\]]*)\]\((https?:\/\/[^\s\)]+|\/[^\s\)]+)\)$/);
    if (imgMatch) {
      blocks.push({
        type: 'image',
        content: imgMatch[2].trim(),
        items: [imgMatch[1].trim()]
      });
      continue;
    }

    // Check H1
    if (trimmed.startsWith('# ')) {
      blocks.push({
        type: 'h1',
        content: trimmed.replace(/^#\s+/, '').trim()
      });
      continue;
    }

    // Check H2
    if (trimmed.startsWith('## ')) {
      blocks.push({
        type: 'h2',
        content: trimmed.replace(/^##\s+/, '').trim()
      });
      continue;
    }

    // Check H3
    if (trimmed.startsWith('### ')) {
      blocks.push({
        type: 'h3',
        content: trimmed.replace(/^###\s+/, '').trim()
      });
      continue;
    }

    // Check Blockquote
    if (trimmed.startsWith('> ')) {
      const quoteText = trimmed.split('\n').map(l => l.replace(/^>\s*/, '').trim()).join(' ');
      blocks.push({
        type: 'blockquote',
        content: quoteText
      });
      continue;
    }

    // Check Unordered List (* or -)
    const lines = trimmed.split('\n').map(l => l.trim()).filter(Boolean);
    const isUnorderedList = lines.length > 0 && lines.every(l => l.startsWith('* ') || l.startsWith('- '));
    if (isUnorderedList) {
      blocks.push({
        type: 'ul',
        items: lines.map(l => l.replace(/^[\*\-]\s+/, '').trim())
      });
      continue;
    }

    // Check Ordered List (1. 2. etc)
    const isOrderedList = lines.length > 0 && lines.every(l => /^\d+\.\s+/.test(l));
    if (isOrderedList) {
      blocks.push({
        type: 'ol',
        items: lines.map(l => l.replace(/^\d+\.\s+/, '').trim())
      });
      continue;
    }

    // Check Table (preserving empty cells)
    const isTable = lines.length >= 2 && lines[0].includes('|') && lines[1].includes('|') && lines[1].includes('-');
    if (isTable) {
      const headers = parseTableRow(lines[0]);
      const rows = lines.slice(2).map(parseTableRow);
      blocks.push({
        type: 'table',
        headers,
        rows
      });
      continue;
    }

    // Default: Paragraph
    blocks.push({
      type: 'paragraph',
      content: trimmed
    });
  }

  return blocks;
}

/**
 * Safely renders inline markdown formatting:
 * - ![Image Alt](url) -> <img> with responsive styles and alt text
 * - [Link Text](/path) -> Next.js <a> with nested formatting support
 * - **Bold Text** -> <strong> with nested formatting support
 * - *Italic Text* or _Italic Text_ -> <em>
 * - `code` -> <code>
 * Zero dangerouslySetInnerHTML used.
 */
export function renderFormattedText(text: string): React.ReactNode[] {
  if (!text) return [];

  // Match:
  // 1. Markdown image: ![alt](url)
  // 2. Markdown link: [label](url)
  // 3. Bold: **text**
  // 4. Italic: *text* or _text_
  // 5. Inline code: `code`
  const regex = /(!\[[^\]]*\]\([^\)]+\))|(\[[^\]]+\]\([^\)]+\))|(\*\*[^*]+\*\*)|(\*[^*]+\*)|(_[^_]+_)|(`[^`]+`)/g;
  const parts = text.split(regex).filter(Boolean);

  return parts.map((part, i) => {
    // 1. Markdown image: ![alt](url)
    const imgMatch = part.match(/^!\[([^\]]*)\]\(([^\)]+)\)$/);
    if (imgMatch) {
      const [, altText, rawSrc] = imgMatch;
      const cleanSrc = rawSrc.trim();
      const lowerSrc = cleanSrc.toLowerCase();

      // Validate URL protocol
      const isValidSrc = lowerSrc.startsWith("https://") || lowerSrc.startsWith("http://") || lowerSrc.startsWith("/");
      if (!isValidSrc) {
        return React.createElement(React.Fragment, { key: i }, altText || "");
      }

      return React.createElement(
        "figure",
        { key: i, className: "my-6 inline-block max-w-full" },
        React.createElement("img", {
          src: cleanSrc,
          alt: altText || "Article image",
          loading: "lazy",
          className: "w-full max-h-[500px] object-cover rounded-none border border-slate-200 shadow-sm"
        }),
        altText ? React.createElement("figcaption", { className: "text-xs text-slate-500 mt-2 text-center italic" }, altText) : null
      );
    }

    // 2. Markdown link: [label](href)
    const linkMatch = part.match(/^\[([^\]]+)\]\(([^\)]+)\)$/);
    if (linkMatch) {
      const [, label, rawHref] = linkMatch;
      const cleanHref = rawHref.trim();
      const lowerHref = cleanHref.toLowerCase();

      // Security check: reject unsafe protocols
      const isUnsafe = lowerHref.startsWith("javascript:") || lowerHref.startsWith("data:") || lowerHref.startsWith("vbscript:");
      if (isUnsafe) {
        return React.createElement(React.Fragment, { key: i }, label);
      }

      const isInternal = cleanHref.startsWith('/') || cleanHref.startsWith('#');
      // Format nested label (e.g. [**Bold Link**](/url))
      const formattedLabel = renderFormattedText(label);

      if (isInternal) {
        return React.createElement(
          "a",
          {
            key: i,
            href: cleanHref,
            className: "text-construction-navy font-bold underline decoration-construction-red/60 hover:decoration-construction-red hover:text-construction-red transition-colors"
          },
          formattedLabel
        );
      }

      // Valid external link
      const isHttp = lowerHref.startsWith("http://") || lowerHref.startsWith("https://") || lowerHref.startsWith("tel:") || lowerHref.startsWith("mailto:");
      if (isHttp) {
        return React.createElement(
          "a",
          {
            key: i,
            href: cleanHref,
            target: "_blank",
            rel: "noopener noreferrer",
            className: "text-construction-navy font-bold underline decoration-construction-red/60 hover:decoration-construction-red hover:text-construction-red transition-colors"
          },
          formattedLabel
        );
      }

      return React.createElement(React.Fragment, { key: i }, formattedLabel);
    }

    // 3. Bold text: **label** (supports nested formatting)
    const boldMatch = part.match(/^\*\*(.*?)\*\*$/);
    if (boldMatch) {
      return React.createElement(
        "strong",
        {
          key: i,
          className: "text-slate-900 font-bold"
        },
        renderFormattedText(boldMatch[1])
      );
    }

    // 4. Italic text: *label* or _label_
    const italicMatch = part.match(/^(\*|_)(.*?)\1$/);
    if (italicMatch) {
      return React.createElement(
        "em",
        {
          key: i,
          className: "italic text-slate-800"
        },
        renderFormattedText(italicMatch[2])
      );
    }

    // 5. Inline code: `code`
    const codeMatch = part.match(/^`(.*?)`$/);
    if (codeMatch) {
      return React.createElement(
        "code",
        {
          key: i,
          className: "px-1.5 py-0.5 bg-slate-100 text-construction-navy text-[0.9em] font-mono border border-slate-200"
        },
        codeMatch[1]
      );
    }

    return React.createElement(React.Fragment, { key: i }, part);
  });
}
