'use client';
import { useEffect, useRef } from 'react';

const TOOLBAR = [
  [{ header: [1, 2, 3, 4, false] }],
  [{ font: [] }],
  [{ size: ['small', false, 'large', 'huge'] }],
  ['bold', 'italic', 'underline', 'strike'],
  [{ color: [] }, { background: [] }],
  [{ list: 'ordered' }, { list: 'bullet' }],
  [{ indent: '-1' }, { indent: '+1' }],
  ['blockquote', 'code-block'],
  [{ align: 'right' }, { align: 'center' }, { align: '' }, { align: 'justify' }],
  ['link'],
  ['clean'],
];

export default function QuillEditor({ value, onChange, placeholder }) {
  const containerRef = useRef(null);
  const quillRef     = useRef(null);
  const changeRef    = useRef(onChange);

  useEffect(() => { changeRef.current = onChange; }, [onChange]);

  useEffect(() => {
    let isMounted = true; // guard against Strict Mode double-invoke

    (async () => {
      if (!containerRef.current) return;

      const [{ default: Quill }] = await Promise.all([
        import('quill'),
        import('quill/dist/quill.snow.css'),
      ]);

      // By the time the async import resolves, the effect may have been
      // cleaned up (Strict Mode unmount). Bail out if so.
      if (!isMounted || !containerRef.current) return;

      // Also bail if a Quill instance already exists (extra safety).
      if (quillRef.current) return;

      const el = document.createElement('div');
      containerRef.current.appendChild(el);

      const q = new Quill(el, {
        theme: 'snow',
        placeholder: placeholder || 'أدخل المحتوى هنا...',
        modules: { toolbar: TOOLBAR },
      });

      quillRef.current = q;
      q.root.setAttribute('dir', 'rtl');

      if (value) q.root.innerHTML = value;

      q.on('text-change', () => {
        const html = q.root.innerHTML;
        changeRef.current(html === '<p><br></p>' ? '' : html);
      });
    })();

    return () => {
      isMounted = false;
      if (quillRef.current) quillRef.current.off('text-change');
      quillRef.current = null;
      if (containerRef.current) containerRef.current.innerHTML = '';
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync value from outside (e.g. switching edit target)
  useEffect(() => {
    const q = quillRef.current;
    if (!q) return;
    const cur = q.root.innerHTML === '<p><br></p>' ? '' : q.root.innerHTML;
    if ((value || '') !== cur) q.root.innerHTML = value || '';
  }, [value]);

  return (
    <div
      ref={containerRef}
      style={{
        direction: 'rtl',
        background: 'var(--bg-card)',
        borderRadius: 'var(--r-md)',
        overflow: 'hidden',
      }}
    />
  );
}