import Link from 'next/link';
import styles from './CourseCard.module.css';

export default function CourseCard({ course }) {
  const sectionCount = course.section_count || 0;

  return (
    <Link href={`/courses/${course.id}`} className={styles.card}>
      <div className={styles.cover} style={{ background: `linear-gradient(135deg, ${course.cover_color}dd, ${course.cover_color}88)` }}>
        <span className={styles.coverIcon}>📖</span>
        {course.level && (
          <span className={styles.level}>{course.level}</span>
        )}
      </div>
      <div className={styles.body}>
        {course.category_name && (
          <span className={styles.category} style={{ color: course.category_color || 'var(--accent)' }}>
            {course.category_name}
          </span>
        )}
        <h3 className={styles.title}>{course.title}</h3>
        {course.description && (
          <p className={styles.desc}>{course.description}</p>
        )}
        <div className={styles.meta}>
          <span className={styles.sections}>
            📝 {sectionCount} {sectionCount === 1 ? 'مقطع' : 'مقاطع'}
          </span>
          <span className={styles.readMore}>اقرأ المزيد ←</span>
        </div>
      </div>
    </Link>
  );
}