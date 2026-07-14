import { useEffect, useRef, useState } from 'react';
import * as api from '../../services/api';
import { FEEDBACK_CATS } from '../../utils/feedbackShared';
import { useToast } from '../../contexts/ToastContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { analytics } from '../../services/analytics';
import { FeedbackDraft } from '../../utils/feedbackDraft';
import EmojiPicker from './EmojiPicker';
import ScreenshotUpload from './ScreenshotUpload';

const EMPTY = { category: null, name: '', email: '', subject: '', priority: 'Medium', message: '', rating: 0, recommend: null, anonymous: false };

export default function FeedbackForm({ context, onSuccess, onSeeTrending }) {
  const toast = useToast();
  const { push } = useNotifications();
  const [form, setForm] = useState(() => {
    const draft = FeedbackDraft.load();
    return draft ? { ...EMPTY, ...draft } : EMPTY;
  });
  const [screenshot, setScreenshot] = useState(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [draftRestored] = useState(() => !!FeedbackDraft.load());
  const messageRef = useRef(null);

  // Autosave the draft (excluding the screenshot — File objects can't be
  // serialized to localStorage) so an accidental close doesn't lose it.
  useEffect(() => {
    const hasContent = form.name || form.email || form.subject || form.message || form.category;
    if (hasContent) FeedbackDraft.save(form);
    else FeedbackDraft.clear();
  }, [form]);

  function resetForm() {
    setForm(EMPTY);
    setScreenshot(null);
    setError('');
    setSuccess(false);
    FeedbackDraft.clear();
  }

  function insertEmoji(emoji) {
    setForm((f) => ({ ...f, message: `${f.message}${emoji}` }));
    messageRef.current?.focus();
  }

  async function submit() {
    setError('');
    const { category, name, email, subject, message } = form;
    if (!category) return setError('Pick a category first.');
    if (!name.trim()) return setError('Name is required.');
    if (!email.trim() || !email.includes('@')) return setError('Valid email required.');
    if (!subject.trim()) return setError('Subject is required.');
    if (!message.trim()) return setError('Message is required.');

    setSubmitting(true);
    try {
      const ctx = context?.() || {};
      await api.submitFeedback({
        name: name.trim(), email: email.trim(), subject: subject.trim(), message: message.trim(),
        category, priority: form.priority, rating: form.rating || null,
        would_recommend: form.recommend, is_anonymous: form.anonymous,
        business_id: ctx.id || null, business_name: ctx.name || null,
      });
      setSuccess(true);
      FeedbackDraft.clear();
      toast.success('Feedback submitted — thank you!');
      analytics.feedbackSubmitted(category);
      push({ type: 'feedback', title: 'Feedback submitted', body: subject });
      onSuccess?.();
    } catch (e) {
      const msg = e?.response?.data?.error || 'Could not submit. Try again.';
      setError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  }

  const ctxInfo = context?.() || {};

  if (success) {
    return (
      <div className="fb-success">
        <div className="fb-success-ico">🎉</div>
        <div className="fb-success-title">Thank you!</div>
        <div className="fb-success-sub">Your feedback helps make ThinkEasy better for everyone.</div>
        <div className="fb-success-btns">
          {onSeeTrending && <button type="button" onClick={() => { resetForm(); onSeeTrending(); }}>See Trending</button>}
          <button type="button" onClick={resetForm}>Submit Another</button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {ctxInfo.name && <div className="fb-ctx-tag">📍 About: <b>{ctxInfo.name}</b></div>}
      {draftRestored && (
        <div className="fb-draft-banner">
          <i className="ti ti-device-floppy" /> Restored your unfinished draft.
          <button type="button" onClick={resetForm}>Discard</button>
        </div>
      )}
      <div className="fb-field">
        <label>What's this about?</label>
        <div className="fb-cat-grid">
          {FEEDBACK_CATS.map((c) => (
            <button
              key={c.v} type="button"
              className={`fb-cat-chip${form.category === c.v ? ' sel' : ''}`}
              onClick={() => setForm({ ...form, category: c.v })}
            >
              {c.i} {c.v}
            </button>
          ))}
        </div>
      </div>
      <div className="fb-row2">
        <div className="fb-field" style={{ marginBottom: 0 }}>
          <label>Name *</label>
          <input type="text" placeholder="Your name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div className="fb-field" style={{ marginBottom: 0 }}>
          <label>Email *</label>
          <input type="email" placeholder="you@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </div>
      </div>
      <div className="fb-field">
        <label>Subject *</label>
        <input type="text" placeholder="Brief summary…" maxLength={200} value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
      </div>
      <div className="fb-field">
        <label>Priority</label>
        <div className="fb-pri-row">
          {['Low', 'Medium', 'High', 'Critical'].map((p) => (
            <button key={p} type="button" className={`fb-pri-chip${form.priority === p ? ' sel' : ''}`} onClick={() => setForm({ ...form, priority: p })}>{p}</button>
          ))}
        </div>
      </div>
      <div className="fb-field">
        <div className="fb-message-label-row">
          <label>Message *</label>
          <EmojiPicker onSelect={insertEmoji} />
        </div>
        <textarea ref={messageRef} maxLength={1000} placeholder="Tell us what you think… (supports **bold**, *italic*, `code`)" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
        <div className={`fb-charcount${form.message.length > 900 ? ' warn' : ''}`}>{form.message.length} / 1000</div>
        <ScreenshotUpload onChange={setScreenshot} />
      </div>
      <div className="fb-field">
        <label>Rating</label>
        <div className="fb-stars">
          {[1, 2, 3, 4, 5].map((v) => (
            <span key={v} className={v <= form.rating ? 'on' : ''} onClick={() => setForm({ ...form, rating: v })}>⭐</span>
          ))}
        </div>
      </div>
      <div className="fb-field">
        <label>Would you recommend ThinkEasy?</label>
        <div className="fb-rec-row">
          <button type="button" className={`fb-rec-chip${form.recommend === 'Yes' ? ' sel' : ''}`} onClick={() => setForm({ ...form, recommend: 'Yes' })}>👍 Yes</button>
          <button type="button" className={`fb-rec-chip${form.recommend === 'Maybe' ? ' sel' : ''}`} onClick={() => setForm({ ...form, recommend: 'Maybe' })}>🤔 Maybe</button>
          <button type="button" className={`fb-rec-chip${form.recommend === 'No' ? ' sel' : ''}`} onClick={() => setForm({ ...form, recommend: 'No' })}>👎 No</button>
        </div>
      </div>
      <div className="fb-anon-row">
        <span className="fb-anon-lbl">🕵️ Submit anonymously</span>
        <div className={`fb-switch${form.anonymous ? ' on' : ''}`} onClick={() => setForm({ ...form, anonymous: !form.anonymous })} />
      </div>
      {error && <div className="fb-error">{error}</div>}
      <button className="fb-submit-btn" type="button" disabled={submitting} onClick={submit}>
        {submitting ? 'Sending…' : 'Send Feedback ✨'}
      </button>
    </div>
  );
}
