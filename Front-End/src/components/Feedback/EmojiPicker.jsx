import { useState } from 'react';

const EMOJIS = ['😀', '😊', '😍', '🤔', '😅', '😢', '😡', '👍', '👎', '🙏', '🔥', '🚀', '💡', '⭐', '❤️', '🎉', '✅', '❌', '⚠️', '🐞'];

export default function EmojiPicker({ onSelect }) {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button
        type="button"
        className="fb-emoji-btn"
        onClick={() => setOpen((v) => !v)}
        aria-label="Insert emoji"
      >
        😊
      </button>
      {open && (
        <div className="fb-emoji-popover" onMouseLeave={() => setOpen(false)}>
          {EMOJIS.map((e) => (
            <button
              key={e}
              type="button"
              className="fb-emoji-option"
              onClick={() => { onSelect(e); setOpen(false); }}
            >
              {e}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
