import React from 'react';

export interface FaqItem {
  question: string;
  answer: string;
}

export interface MarkdownBlock {
  type: 'h1' | 'h2' | 'h3' | 'paragraph' | 'ul' | 'ol' | 'blockquote' | 'table';
  content?: string;
  items?: string[];
  headers?: string[];
  rows?: string[][];
}

/**
 * Strips leading '# Title' if present (to avoid duplicate H1 when Hero already displays H1)
 * and enriches known pillar posts with natural, high-value contextual internal links.
 */
export function enrichBlogContent(slug: string, rawContent: string): string {
  if (!rawContent) return "";

  // 1. Remove duplicate leading H1 markdown (# Title)
  let content = rawContent.replace(/^#\s+[^\n]+\n+/, '');

  // 2. Add natural contextual internal links to the existing guide if not already linked
  if (slug === 'house-construction-cost-in-rajasthan-a-complete-guide-for-2026') {
    // Contextual link for Architectural Planning
    if (!content.includes('/services/architecture-planning')) {
      content = content.replace(
        'A well-designed house can help you use your available space efficiently while avoiding unnecessary construction costs.',
        'A well-designed house can help you use your available space efficiently while avoiding unnecessary construction costs. Coordinating comprehensive [architectural planning and structural engineering](/services/architecture-planning) ensures drawings account for circulation, regional climate, and structural integrity.'
      );
    }

    // Contextual link for Cost Estimator
    if (!content.includes('/cost-estimator')) {
      content = content.replace(
        'A useful way to begin estimating your budget is:',
        'A convenient way to begin estimating your budget is using an online [construction cost estimator](/cost-estimator) or applying the standard area calculation:'
      );
    }

    // Contextual link for Surveying
    if (!content.includes('/services/surveying-site-measurements')) {
      content = content.replace(
        'A professional site survey can help determine:',
        'High-precision [land surveying and site measurement](/services/surveying-site-measurements) helps determine:'
      );
    }

    // Contextual link for Turnkey Construction & PMC
    if (!content.includes('/services/professional-construction-services')) {
      content = content.replace(
        'A professional construction company can help coordinate areas such as:',
        'Engaging a dependable [turnkey construction contractor](/services/professional-construction-services) or independent [project management consultancy (PMC)](/services/project-management-consultancy) helps coordinate key stages including:'
      );
    }

    // Contextual link in Call to Action
    if (!content.includes('/cost-estimator), explore our [professional construction services]')) {
      content = content.replace(
        '**Planning to build your home? Contact Hindustan Projects to discuss your construction requirements and get a project-specific estimate.**',
        '**Planning to build your home in Rajasthan? Use our [online cost estimator](/cost-estimator), explore our [professional construction services](/services/professional-construction-services), or contact Hindustan Projects to discuss your project requirements.**'
      );
    }
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

/**
 * Robust markdown block parser that cleanly separates:
 * - H1, H2, H3
 * - Bulleted (unordered) lists
 * - Numbered (ordered) lists
 * - Blockquotes
 * - Tables
 * - Standard paragraphs
 */
export function parseMarkdownBlocks(content: string): MarkdownBlock[] {
  if (!content) return [];

  const rawBlocks = content.split(/\n{2,}/);
  const blocks: MarkdownBlock[] = [];

  for (const rawBlock of rawBlocks) {
    const trimmed = rawBlock.trim();
    if (!trimmed) continue;

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

    // Check Table
    const isTable = lines.length >= 2 && lines[0].includes('|') && lines[1].includes('|') && lines[1].includes('-');
    if (isTable) {
      const headers = lines[0].split('|').map(c => c.trim()).filter(Boolean);
      const rows = lines.slice(2).map(r => r.split('|').map(c => c.trim()).filter(Boolean));
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
 * - [Link Text](/path) -> Next.js <Link> or <a>
 * - **Bold Text** -> <strong>
 * Zero dangerouslySetInnerHTML used.
 */
export function renderFormattedText(text: string): React.ReactNode[] {
  if (!text) return [];

  // Match either markdown link [label](url) or bold **text**
  // Using ([^\]]+) and ([^\)]+) avoids greedy captures and mishandled parentheses
  const regex = /(\[[^\]]+\]\([^\)]+\))|(\*\*[^*]+\*\*)/g;
  const parts = text.split(regex).filter(Boolean);

  return parts.map((part, i) => {
    // Markdown link: [label](href)
    const linkMatch = part.match(/^\[([^\]]+)\]\(([^\)]+)\)$/);
    if (linkMatch) {
      const [, label, rawHref] = linkMatch;
      const cleanHref = rawHref.trim();
      const lowerHref = cleanHref.toLowerCase();

      // Security check: reject unsafe protocols like javascript:, data:, vbscript:
      const isUnsafe = lowerHref.startsWith("javascript:") || lowerHref.startsWith("data:") || lowerHref.startsWith("vbscript:");
      if (isUnsafe) {
        return React.createElement(React.Fragment, { key: i }, label);
      }

      const isInternal = cleanHref.startsWith('/') || cleanHref.startsWith('#');
      if (isInternal) {
        return React.createElement(
          "a",
          {
            key: i,
            href: cleanHref,
            className: "text-construction-navy font-bold underline decoration-construction-red/60 hover:decoration-construction-red hover:text-construction-red transition-colors"
          },
          label
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
          label
        );
      }

      // Fallback for non-http unrecognized protocol: render safe text
      return React.createElement(React.Fragment, { key: i }, label);
    }

    // Bold text: **label**
    const boldMatch = part.match(/^\*\*(.*?)\*\*$/);
    if (boldMatch) {
      return React.createElement(
        "strong",
        {
          key: i,
          className: "text-slate-900 font-bold"
        },
        boldMatch[1]
      );
    }

    return React.createElement(React.Fragment, { key: i }, part);
  });
}

