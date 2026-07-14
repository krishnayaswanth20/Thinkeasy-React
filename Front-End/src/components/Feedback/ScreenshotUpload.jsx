import { useRef, useState } from 'react';

export default function ScreenshotUpload({ onChange }) {
  const inputRef = useRef(null);
  const [preview, setPreview] = useState(null);

  function pick(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
    onChange?.(file);
  }

  function remove() {
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    onChange?.(null);
    if (inputRef.current) inputRef.current.value = '';
  }

  return (
    <div className="fb-screenshot">
      {!preview ? (
        <button type="button" className="fb-screenshot-btn" onClick={() => inputRef.current?.click()}>
          <i className="ti ti-camera" /> Attach a screenshot
        </button>
      ) : (
        <div className="fb-screenshot-preview">
          <img src={preview} alt="Screenshot preview" />
          <button type="button" className="fb-screenshot-remove" onClick={remove} aria-label="Remove screenshot">
            <i className="ti ti-x" />
          </button>
        </div>
      )}
      <input ref={inputRef} type="file" accept="image/*" onChange={pick} style={{ display: 'none' }} />
      <div className="fb-screenshot-note">Preview only for now — screenshots aren't uploaded to the server yet.</div>
    </div>
  );
}
