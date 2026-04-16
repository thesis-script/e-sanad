'use client';
import { useState } from 'react';
import CourseCard from '@/components/public/CourseCard';
import styles from '../page.module.css';

export default function CategoryCoursesSearch({ courses }) {
    const [query, setQuery] = useState('');

    const filtered = courses.filter(c =>
        c.title.toLowerCase().includes(query.toLowerCase()) ||
        (c.description || '').toLowerCase().includes(query.toLowerCase())
    );

    return (
        <>
            <div className={styles.searchWrap}>
                <span className={styles.searchIcon}>🔍</span>
                <input
                    className={styles.search}
                    type="text"
                    placeholder="ابحث عن درس..."
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

            <div className={styles.grid}>
                {filtered.length === 0 ? (
                    <div className={styles.empty}>
                        <span>📚</span>
                        <h3>{query ? 'لا توجد نتائج' : 'لا توجد دروس في هذه الفئة بعد'}</h3>
                        <p>{query ? 'حاول البحث بكلمات مختلفة' : 'سيتم إضافة الدروس قريبًا'}</p>
                    </div>
                ) : (
                    filtered.map(course => <CourseCard key={course.id} course={course} />)
                )}
            </div>
        </>
    );
}