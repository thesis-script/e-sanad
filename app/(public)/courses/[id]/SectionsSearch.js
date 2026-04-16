'use client';
import { useState } from 'react';
import styles from './page.module.css';
import 'quill/dist/quill.snow.css';

export default function SectionsSearch({ sections, coverColor }) {
  const [query, setQuery] = useState('');

  const filtered = sections.filter(s =>
    s.title.toLowerCase().includes(query.toLowerCase()) ||
    (s.content || '').toLowerCase().includes(query.toLowerCase())
  );

  return (
    <>
      <div className={styles.searchWrap}>
        <span className={styles.searchIcon}>🔍</span>
        <input
          className={styles.search}
          type="text"
          placeholder="ابحث في مقاطع الدرس..."
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
        {query && (
          <button className={styles.searchClear} onClick={() => setQuery('')}>✕</button>
        )}
      </div>

      {query && (
        <p className={styles.searchResults}>
          {filtered.length} نتيجة للبحث عن "{query}"
        </p>
      )}

      {filtered.length === 0 ? (
        <div className={styles.empty}>
          <span>🔍</span>
          <h3>لا توجد نتائج</h3>
          <p>حاول البحث بكلمات مختلفة</p>
        </div>
      ) : (
        <div className={styles.sectionsList}>
          {filtered.map((section, index) => (
            <div key={section.id} className={styles.sectionCard}>
              <div className={styles.sectionHeader}>
                <span
                  className={styles.sectionNumber}
                  style={{ background: `${coverColor}18`, color: coverColor }}
                >
                  {index + 1}
                </span>
                <h2 style={{ color: '#3A9AFF' }}>{section.title}</h2>
              </div>
              {/* ql-snow + ql-editor classes restore Quill's formatting styles */}
              <div className={`${styles.sectionContent} ql-snow`}>
                <div
                  className="ql-editor"
                  style={{
                    color: '#04143a',
                    direction: 'rtl',
                    textAlign: 'right',
                    padding: 0,
                    fontSize: '1.05rem',
                    lineHeight: '2',
                    fontFamily: "'Cairo', sans-serif",
                  }}
                  dangerouslySetInnerHTML={{ __html: section.content }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}