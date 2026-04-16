'use client';
import { useState } from 'react';
import dynamic from 'next/dynamic';

const QuillEditor = dynamic(() => import('@/components/admin/QuillEditor'), {
  ssr: false,
  loading: () => <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>جارٍ تحميل المحرر...</div>,
});

const COLORS = ['#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ef4444', '#06b6d4', '#f97316', '#84cc16'];
const LEVELS = ['بكالوريا', 'متقدم', 'متوسط', 'مبتدئ'];

export default function CourseFormModal({ initial = {}, categories, onSubmit, onClose, loading, title }) {
  const [form, setForm] = useState({
    title: initial.title || '', description: initial.description || '',
    category_id: initial.category_id || (categories[0]?.id || ''),
    cover_color: initial.cover_color || '#3b82f6',
    level: initial.level || 'بكالوريا', is_published: initial.is_published !== false,
  });
  const [error, setError] = useState('');
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  async function handleSubmit(e) {
    e.preventDefault(); setError('');
    const result = await onSubmit(form);
    if (result?.error) setError(result.error);
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: '720px', width: '100vw' }}>
        <div className="modal-header">
          <h3 style={{ fontFamily: 'Cairo,sans-serif', fontSize: '1.05rem', fontWeight: 700, color: 'var(--primary)' }}>{title}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.4rem', color: 'var(--text-muted)', lineHeight: 1 }}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && <div className="alert alert-error">{error}</div>}

            {/* Title */}
            <div className="form-group">
              <label className="form-label">عنوان الدرس *</label>
              <input className="form-input" value={form.title} onChange={e => set('title', e.target.value)} placeholder="مثل: مدخل إلى الشعر الجاهلي" required />
            </div>

            {/* Description — bigger editor */}
            <div className="form-group">
              <label className="form-label">الوصف</label>
              <div style={{
                border: '1.5px solid var(--border)',
                borderRadius: 'var(--r-md)',
                overflow: 'hidden',
                minHeight: '260px',
                color: 'black'
              }}>
                <QuillEditor
                  value={form.description}
                  onChange={(value) => set('description', value)}
                  placeholder="نبذة مختصرة عن محتوى الدرس..."
                />
              </div>
              <style>{`
                .ql-container { min-height: 200px; font-family: 'Cairo', sans-serif; font-size: 1rem; }
                .ql-editor { min-height: 200px; padding: 16px; line-height: 1.8; }
                .ql-toolbar { border-bottom: 1.5px solid var(--border) !important; border-top: none !important; border-left: none !important; border-right: none !important; background: var(--bg); padding: 8px 12px; flex-wrap: wrap; }
                .ql-container.ql-snow { border: none !important; }
              `}</style>
            </div>

            {/* Category + Level */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">الفئة *</label>
                <select className="form-select" value={form.category_id} onChange={e => set('category_id', e.target.value)} required>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">المستوى</label>
                <select className="form-select" value={form.level} onChange={e => set('level', e.target.value)}>
                  {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
            </div>

            {/* Cover color */}
            <div className="form-group">
              <label className="form-label">لون الغلاف</label>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                {COLORS.map(c => (
                  <button key={c} type="button"
                    style={{ width: 32, height: 32, borderRadius: '50%', background: c, border: form.cover_color === c ? '3px solid var(--primary)' : '3px solid transparent', cursor: 'pointer', transition: 'transform 0.15s', transform: form.cover_color === c ? 'scale(1.2)' : 'scale(1)' }}
                    onClick={() => set('cover_color', c)} />
                ))}
                <div style={{ width: 60, height: 32, borderRadius: 8, background: `linear-gradient(135deg,${form.cover_color},${form.cover_color}88)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>📖</div>
              </div>
            </div>

            {/* Publish toggle */}
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
              <input type="checkbox" checked={form.is_published} onChange={e => set('is_published', e.target.checked)} style={{ width: 18, height: 18, accentColor: 'var(--accent)' }} />
              <span className="form-label" style={{ marginBottom: 0 }}>نشر الدرس (مرئي للزوار)</span>
            </label>
          </div>

          <div className="modal-footer">
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'جارٍ الحفظ...' : 'حفظ الدرس'}</button>
            <button type="button" className="btn btn-ghost" onClick={onClose}>إلغاء</button>
          </div>
        </form>
      </div>
    </div>
  );
}