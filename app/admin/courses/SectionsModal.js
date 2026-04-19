'use client';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import styles from './SectionsModal.module.css';

const QuillEditor = dynamic(() => import('@/components/admin/QuillEditor'), {
  ssr: false,
  loading: () => (
    <div style={{
      height: 200, border: '1.5px solid var(--border)', borderRadius: 'var(--r-md)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: 'var(--text-muted)', fontSize: '0.9rem', background: 'var(--bg-warm)',
    }}>
      جارٍ تحميل المحرر...
    </div>
  ),
});

const EMPTY = { title: '', content: '' };

function stripHtml(html) {
  return html?.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim() || '';
}

export default function SectionsModal({ course, onClose, onCountChange }) {
  const [sections, setSections] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editSection, setEditSection] = useState(null);
  const [deleteSection, setDeleteSection] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [editorKey, setEditorKey] = useState(0);

  useEffect(() => {
    fetch(`/api/courses/${course.id}`)
      .then(r => r.json())
      .then(d => { setSections(d.course?.sections || []); setLoadingData(false); })
      .catch(() => setLoadingData(false));
  }, [course.id]);

  function resetForm() { setForm(EMPTY); setError(''); setEditorKey(k => k + 1); }
  function startAdd() { setEditSection(null); resetForm(); setShowForm(true); }
  function startEdit(s) { setEditSection(s); setForm({ title: s.title, content: s.content }); setEditorKey(k => k + 1); setShowForm(false); setError(''); }
  function cancelForm() { setShowForm(false); setEditSection(null); resetForm(); }

  async function handleSave(e) {
    e.preventDefault();
    const cleanContent = form.content?.replace(/<[^>]*>/g, '').trim();
    if (!cleanContent) { setError('المحتوى مطلوب'); return; }
    setSaving(true); setError('');
    try {
      if (editSection) {
        const res = await fetch(`/api/sections/${editSection.id}`, {
          method: 'PUT', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...form, order_index: editSection.order_index }),
        });
        const data = await res.json();
        if (!res.ok) { setError(data.error); return; }
        setSections(p => p.map(s => s.id === editSection.id ? data.section : s));
        setEditSection(null); resetForm();
      } else {
        const res = await fetch('/api/sections', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...form, course_id: course.id }),
        });
        const data = await res.json();
        if (!res.ok) { setError(data.error); return; }
        setSections(p => [...p, data.section]);
        onCountChange(1); setShowForm(false); resetForm();
      }
    } catch { setError('خطأ في الاتصال'); }
    finally { setSaving(false); }
  }

  async function handleDelete() {
    setSaving(true);
    try {
      await fetch(`/api/sections/${deleteSection.id}`, { method: 'DELETE' });
      setSections(p => p.filter(s => s.id !== deleteSection.id));
      onCountChange(-1); setDeleteSection(null);
    } catch { }
    finally { setSaving(false); }
  }

  const isFormVisible = showForm || !!editSection;

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <div>
            <h2 className={styles.title}>عناوين ومحتوى الدرس</h2>
            <p className={styles.sub}>{course.title}</p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            {!isFormVisible && (
              <button className="btn btn-primary btn-sm" onClick={startAdd}>+ عنوان جديد</button>
            )}
            <button onClick={onClose} className="btn btn-ghost btn-sm">إغلاق</button>
          </div>
        </div>

        <div className={styles.body}>
          {isFormVisible && (
            <div className={styles.formSection}>
              <h4 className={styles.formTitle}>
                {editSection ? `✏️ تعديل: ${editSection.title}` : '➕ إضافة عنوان جديد'}
              </h4>
              {error && <div className="alert alert-error" style={{ marginBottom: 14 }}>{error}</div>}
              <form onSubmit={handleSave}>
                <div className="form-group" style={{ marginBottom: 18 }}>
                  <label className="form-label">العنوان *</label>
                  <input
                    className="form-input"
                    value={form.title}
                    onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                    placeholder="مثل: تعريف الشعر الجاهلي، خصائص الأسلوب، أبرز الشعراء..."
                    required
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 18 }}>
                  <label className="form-label">المحتوى والشرح *</label>
                  <div className={styles.editorWrap}>
                    <QuillEditor
                      key={editorKey}
                      value={form.content}
                      onChange={v => setForm(p => ({ ...p, content: v }))}
                      placeholder="أدخل شرحاً مفصّلاً... يمكنك استخدام التنسيق والقوائم والاقتباسات"
                    />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>
                    {saving ? 'جارٍ الحفظ...' : (editSection ? 'حفظ التعديلات' : 'إضافة العنوان')}
                  </button>
                  <button type="button" className="btn btn-ghost btn-sm" onClick={cancelForm}>إلغاء</button>
                </div>
              </form>
            </div>
          )}

          {loadingData ? (
            <div style={{ textAlign: 'center', padding: 40 }}>
              <div className="spinner" style={{ margin: '0 auto' }}></div>
            </div>
          ) : sections.length === 0 ? (
            <div className={styles.empty}>
              <span>📄</span>
              <p>لا توجد عناوين بعد. أضف أول عنوان لهذا الدرس.</p>
              {!isFormVisible && (
                <button className="btn btn-primary btn-sm" style={{ marginTop: 12 }} onClick={startAdd}>
                  + إضافة عنوان
                </button>
              )}
            </div>
          ) : (
            <div className={styles.sectionsList}>
              <p className={styles.listMeta}>{sections.length} عنوان مضاف</p>
              {sections.map((section, idx) => (
                <div key={section.id} className={`${styles.sectionItem} ${deleteSection?.id === section.id ? styles.deleting : ''} ${editSection?.id === section.id ? styles.editing : ''}`}>
                  {deleteSection?.id === section.id ? (
                    <div className={styles.confirmDelete}>
                      <p>هل تريد حذف «{section.title}»؟</p>
                      <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                        <button className="btn btn-danger btn-sm" onClick={handleDelete} disabled={saving}>{saving ? '...' : 'نعم، احذف'}</button>
                        <button className="btn btn-ghost btn-sm" onClick={() => setDeleteSection(null)}>إلغاء</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className={styles.sectionTop}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <span className={styles.sectionIdx} style={{ background: `${course.cover_color}18`, color: course.cover_color }}>{idx + 1}</span>
                          <span className={styles.sectionTitle}>{section.title}</span>
                        </div>
                        <div className={styles.sectionActions}>
                          <button className="btn btn-ghost btn-sm" onClick={() => startEdit(section)}>تعديل</button>
                          <button className="btn btn-danger btn-sm" onClick={() => setDeleteSection(section)}>حذف</button>
                        </div>
                      </div>
                      <p className={styles.sectionPreview}>
                        {stripHtml(section.content).substring(0, 150)}{stripHtml(section.content).length > 150 ? '...' : ''}
                      </p>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}