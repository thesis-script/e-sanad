// components/public/CategoryCard.js
import Link from 'next/link';
import styles from './CategoryCard.module.css';

const ICONS = {
  Feather: '🪶',
  FileText: '📝',
  BookOpen: '📖',
  Theater: '🎭',
  Award: '🏛️',
  default: '📚',
};

export default function CategoryCard({ category }) {
  const icon = ICONS[category.icon] || ICONS.default;
  const count = category.course_count || 0;

  return (
    <Link href={`/categories/${category.id}`} className={styles.card} style={{ background: `${category.color}25`, border: `2px solid ${category.color}30` }}>
      <div className={styles.iconWrap} style={{ background: `${category.color}`, border: `2px solid ${category.color}30` }}>
        <span className={styles.icon}>{icon}</span>
      </div>
      <h3 className={styles.name}>{category.name}</h3>
      <p className={styles.desc}>{category.description}</p>
      <div className={styles.footer}>
        <span className={styles.count} style={{ color: category.color }}>
          {count} {count === 1 ? 'درس' : 'دروس'}
        </span>
        <span className={styles.arrow}>←</span>
      </div>
      <div className={styles.bar} style={{ background: category.color }}></div>
    </Link>
  );
}