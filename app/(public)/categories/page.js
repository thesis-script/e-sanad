import { query } from '@/lib/db';
import CategoryCard from '@/components/public/CategoryCard';
import styles from './page.module.css';

export const metadata = { title: 'الفئات — الأدب العربي' };

async function getCategories() {
  try {
    const res = await query(`
      SELECT c.*, COUNT(co.id) as course_count
      FROM categories c LEFT JOIN courses co ON co.category_id = c.id
      GROUP BY c.id ORDER BY c.created_at DESC
    `);
    return res.rows;
  } catch { return []; }
}

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className="container">
          <h1>الفئات الأدبية</h1>
          <p>جميع فئات الأدب العربي المتاحة لطلاب البكالوريا</p>
        </div>
        {/* <div className={styles.wave}>
          <svg viewBox="0 0 1440 60" preserveAspectRatio="none" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 60L720 20L1440 60V0H0V60Z" fill="#faf8f3"/>
          </svg>
        </div> */}
      </div>

      <div className="container">
        <div className={styles.meta}>
          <span>{categories.length} فئة متاح</span>
        </div>

        {categories.length === 0 ? (
          <div className={styles.empty}>
            <span>📚</span>
            <h3>لا توجد الفئاتبعد</h3>
            <p>سيتم إضافة الفئات قريبًا</p>
          </div>
        ) : (
          <div className={styles.grid}>
            {categories.map(cat => <CategoryCard key={cat.id} category={cat} />)}
          </div>
        )}
      </div>
    </div>
  );
}
