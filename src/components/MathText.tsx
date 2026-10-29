import React, { useMemo } from 'react';
import katex from 'katex';

export interface MathTextProps {
  text: string;
  className?: string;
  block?: boolean;
}

/**
 * Checks if a string contains Telugu or other Indic/non-ASCII script characters.
 * Telugu & Indic scripts rely on complex OpenType shaping (guninthalu / vattulu)
 * and must NEVER be forced into KaTeX math mode unless explicitly wrapped in $...$.
 */
function hasNonAsciiScript(str: string): boolean {
  if (!str) return false;
  // Match Telugu (0C00-0C7F), Devanagari (0900-097F), Tamil, Kannada, Malayalam, etc.
  return /[\u0900-\u0DFF]/.test(str);
}

/**
 * Checks whether a string is an explicit mathematical equation that should be rendered with KaTeX.
 * Never triggers on Telugu/Indic text or ordinary prose with slashes/hyphens.
 */
function isPureMathFormula(str: string): boolean {
  if (!str || str.length > 160) return false;
  if (hasNonAsciiScript(str)) return false;

  // Must contain explicit math symbols like ÷, ×, ±, √, ^, ≤, ≥, ≠
  // (We intentionally exclude plain '/' and '=' unless paired with math symbols so normal dates/ratios/text never break)
  const hasExplicitMathSymbol = /[÷×±√^≤≥≠≈∞]/.test(str);
  if (!hasExplicitMathSymbol) return false;

  // Count multi-letter words (3+ letters) to distinguish prose sentences from compact formulas
  const words = str.match(/[a-zA-Z]{3,}/g) || [];
  return words.length <= 3;
}

/**
 * Converts a plain-text mathematical expression into valid KaTeX LaTeX syntax.
 * Only used for explicit ASCII math formulas.
 */
function convertTextToLatex(input: string): string {
  if (!input || hasNonAsciiScript(input)) return input;
  let s = input.trim();

  // 1. Replace Unicode math symbols with LaTeX commands
  s = s
    .replace(/×/g, ' \\times ')
    .replace(/÷/g, ' \\div ')
    .replace(/±/g, ' \\pm ')
    .replace(/≠/g, ' \\neq ')
    .replace(/≤/g, ' \\leq ')
    .replace(/≥/g, ' \\geq ')
    .replace(/≈/g, ' \\approx ')
    .replace(/∞/g, ' \\infty ')
    .replace(/π/g, ' \\pi ')
    .replace(/θ/g, ' \\theta ')
    .replace(/Δ/g, ' \\Delta ')
    .replace(/°/g, '^\\circ ');

  // 2. Convert square roots: √(x+y) or √x -> \sqrt{...}
  s = s.replace(/√\s*\(([^()]+)\)/g, '\\sqrt{$1}');
  s = s.replace(/√\s*([a-zA-Z0-9]+)/g, '\\sqrt{$1}');

  // 3. Convert exponents: x^2, 10^-3, (a+b)^2 -> ^{...}
  s = s.replace(/\^\s*\(([^()]+)\)/g, '^{$1}');
  s = s.replace(/\^\s*(-?\d+)/g, '^{$1}');

  // 4. Convert purely numeric/algebraic parenthesized fractions: (a + b) / (c + d) where contents are short math tokens
  s = s.replace(
    /\(\s*([0-9a-zA-Z\s\+\-\*\\]+)\s*\)\s*\\div\s*\(\s*([0-9a-zA-Z\s\+\-\*\\]+)\s*\)/g,
    (_, num, den) => {
      if (num.length <= 24 && den.length <= 24) {
        return `\\frac{${num.trim()}}{${den.trim()}}`;
      }
      return `(${num}) \\div (${den})`;
    }
  );

  // 5. Escape % for LaTeX
  s = s.replace(/(?<!\\)%/g, '\\%');

  return s;
}

/**
 * Safely renders a single KaTeX string to HTML, falling back to plain text on any error.
 */
function KaTeXNode({ math, block = false }: { math: string; block?: boolean }) {
  const html = useMemo(() => {
    try {
      // If Telugu/Indic characters accidentally entered a math block, render as plain text to prevent glyph corruption
      if (hasNonAsciiScript(math)) {
        return null;
      }
      return katex.renderToString(math, {
        displayMode: block,
        throwOnError: false,
        strict: false,
        trust: true,
        output: 'html', // Use 'html' only to avoid duplicate MathML+HTML screen-reader/layout artifacts
      });
    } catch {
      return null;
    }
  }, [math, block]);

  if (!html) {
    return <span className="font-semibold">{math}</span>;
  }

  return (
    <span
      className={block ? 'block my-1.5 overflow-x-auto max-w-full' : 'inline-block align-middle max-w-full overflow-x-auto'}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

/**
 * Renders a line of text that may contain explicit $...$, $$...$$, \(...\), or \[...\] LaTeX segments.
 * Plain text (including Telugu, English, numbers, ratios, and slashes) is rendered natively without distortion.
 */
function renderMixedSegments(line: string, isBlockFormula = false): React.ReactNode {
  if (!line) return null;

  const hasExplicitDelimiters = /(\$\$[\s\S]+?\$\$|\$[^$\n]+?\$|\\\[[\s\S]+?\\\]|\\\([\s\S]+?\\\))/.test(line);
  const hasLatexCommands = /\\(frac|sqrt|times|div|pm|cdot|leq|geq|neq|approx|sum|int|alpha|beta|gamma|theta|pi|Delta|infty)\b/.test(line);

  // If the line has explicit LaTeX commands without $ delimiters and no Indic text, render via KaTeX
  if (!hasExplicitDelimiters && hasLatexCommands && !hasNonAsciiScript(line)) {
    return <KaTeXNode math={line} block={isBlockFormula} />;
  }

  // If no explicit LaTeX delimiters exist, check if it's a compact ASCII math formula with √, ^, ÷, ×, ±
  if (!hasExplicitDelimiters) {
    if (isPureMathFormula(line)) {
      return <KaTeXNode math={convertTextToLatex(line)} block={isBlockFormula} />;
    }
    return <span>{line}</span>;
  }

  // Split by explicit LaTeX delimiters: $$...$$, \[...\], $...$, \(...\)
  const tokenRegex = /(\$\$[\s\S]+?\$\$|\\\[[\s\S]+?\\\]|\$[^$\n]+?\$|\\\([\s\S]+?\\\))/g;
  const parts = line.split(tokenRegex);

  return parts.map((part, idx) => {
    if (!part) return null;

    if (part.startsWith('$$') && part.endsWith('$$') && part.length > 4) {
      const math = part.slice(2, -2).trim();
      return <KaTeXNode key={idx} math={math} block={true} />;
    }
    if (part.startsWith('\\[') && part.endsWith('\\]') && part.length > 4) {
      const math = part.slice(2, -2).trim();
      return <KaTeXNode key={idx} math={math} block={true} />;
    }
    if (part.startsWith('$') && part.endsWith('$') && part.length > 2) {
      const math = part.slice(1, -1).trim();
      return <KaTeXNode key={idx} math={math} block={false} />;
    }
    if (part.startsWith('\\(') && part.endsWith('\\)') && part.length > 4) {
      const math = part.slice(2, -2).trim();
      return <KaTeXNode key={idx} math={math} block={false} />;
    }

    return <span key={idx}>{part}</span>;
  });
}

/**
 * Clean, resilient Math & Bilingual (Telugu + English) Text Renderer
 * - Preserves parent font family, font size, line-height, and text color.
 * - Never distorts Telugu script or converts normal text slashes into horizontal fraction bars.
 */
export const MathText: React.FC<MathTextProps> = ({ text, className = '', block = false }) => {
  if (text === null || text === undefined) return null;
  const rawStr = String(text).trim();
  if (!rawStr) return null;

  // Only split into multiple paragraph blocks when actual newline characters exist
  const hasNewLines = rawStr.includes('\n');

  if (hasNewLines || block) {
    const lines = rawStr.split('\n');
    return (
      <div className={`space-y-1.5 max-w-full ${className}`} style={{ color: 'inherit', fontSize: 'inherit', lineHeight: 'inherit' }}>
        {lines.map((line, lIdx) => {
          const trimmedLine = line.trim();
          if (!trimmedLine) return <div key={lIdx} className="h-1.5" />;

          return (
            <div key={lIdx} className="leading-relaxed max-w-full" style={{ color: 'inherit', fontSize: 'inherit' }}>
              {renderMixedSegments(trimmedLine, false)}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <span className={`max-w-full ${className}`} style={{ color: 'inherit', fontSize: 'inherit', lineHeight: 'inherit' }}>
      {renderMixedSegments(rawStr, false)}
    </span>
  );
};

export default MathText;
