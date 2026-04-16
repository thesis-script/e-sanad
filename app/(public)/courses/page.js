'use client';
import { useState, useEffect } from 'react';
import CourseCard from '@/components/public/CourseCard';
import styles from './page.module.css';

export default function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [query, setQuery] = useState('');

  useEffect(() => {
    fetch('/api/courses')
      .then(r => r.json())
      .then(d => setCourses(d.courses || []));
  }, []);

  const filtered = courses.filter(c =>
    c.title.toLowerCase().includes(query.toLowerCase()) ||
    (c.description || '').toLowerCase().includes(query.toLowerCase()) ||
    (c.category_name || '').toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className="container">
          <h1>جميع الدروس</h1>
          <p>مجموعة شاملة من الدروس الأدبية المنظّمة لطلاب البكالوريا</p>
          {/* Search bar */}
          <div className={styles.searchWrap}>
            <input
              className={styles.search}
              type="text"
              placeholder="ابحث عن درس..."
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="container">
        <div className={styles.meta}>
          <span>{filtered.length} درس متاح</span>
        </div>
        {filtered.length === 0 ? (
          <div className={styles.empty}>
            <span>📖</span>
            <h3>{query ? 'لا توجد نتائج' : 'لا توجد دروس بعد'}</h3>
          </div>
        ) : (
          <div className={styles.grid}>
            {filtered.map(c => <CourseCard key={c.id} course={c} />)}
          </div>
        )}
      </div>
    </div>
  );
}