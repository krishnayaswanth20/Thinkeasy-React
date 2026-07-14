import { Fragment } from 'react';

// Deliberately minimal: **bold**, *italic*, `code`, and [text](url) links.
// Not a full markdown spec — just enough for feedback messages to read
// better, safely (no raw HTML is ever rendered).
const PATTERN = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g;

export function renderMarkdownLite(text) {
  const str = String(text ?? '');
  const parts = str.split(PATTERN);

  return parts.map((part, i) => {
    if (/^\*\*[^*]+\*\*$/.test(part)) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    if (/^\*[^*]+\*$/.test(part)) {
      return <em key={i}>{part.slice(1, -1)}</em>;
    }
    if (/^`[^`]+`$/.test(part)) {
      return <code key={i} className="fbc-inline-code">{part.slice(1, -1)}</code>;
    }
    const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (linkMatch) {
      const [, label, url] = linkMatch;
      const safeUrl = /^https?:\/\//i.test(url) ? url : undefined;
      return safeUrl
        ? <a key={i} href={safeUrl} target="_blank" rel="noopener noreferrer">{label}</a>
        : <Fragment key={i}>{label}</Fragment>;
    }
    return <Fragment key={i}>{part}</Fragment>;
  });
}
