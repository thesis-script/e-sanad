import { notFound } from 'next/navigation';
import { query } from '@/lib/db';
import styles from '../page.module.css';
import Link from 'next/link';
import CategoryCoursesSearch from './CategoryCoursesSearch';

async function getData(id) {
    try {
        const catRes = await query('SELECT * FROM categories WHERE id = $1', [id]);
        if (catRes.rows.length === 0) return null;
        const cat = catRes.rows[0];

        const coursesRes = await query(`
      SELECT co.*, c.name as category_name, c.slug as category_slug, c.color as category_color,
             COUNT(s.id) as section_count
      FROM courses co
      LEFT JOIN categories c ON co.category_id = c.id
      LEFT JOIN sections s ON s.course_id = co.id
      WHERE co.category_id = $1 AND co.is_published = true
      GROUP BY co.id, c.name, c.slug, c.color
      ORDER BY co.created_at DESC
    `, [cat.id]);

        return { category: cat, courses: coursesRes.rows };
    } catch {
        return null;
    }
}

export async function generateMetadata({ params }) {
    const { id } = await params;
    const data = await getData(id);
    if (!data) return { title: 'غير موجود' };
    return { title: `${data.category.name} — الأدب العربي` };
}

export default async function CategoryPage({ params }) {
    const { id } = await params;
    const data = await getData(id);
    if (!data) notFound();

    const { category, courses } = data;

    return (
        <div className={styles.page}>
            <div className={styles.header} style={{ '--cat-color': category.color, marginBottom: '2rem' }}>
                <div className="container">
                    <nav className={styles.breadcrumb}>
                        <Link href="/">الرئيسية</Link>
                        <span>/</span>
                        <Link href="/categories">الفئات</Link>
                        <span>/</span>
                        <span>{category.name}</span>
                    </nav>
                    <h1>{category.name}</h1>
                    {category.description && <p>{category.description}</p>}
                    <div className={styles.headerMeta}>
                        <span className={styles.badge} style={{ background: `${category.color}20`, color: category.color }}>
                            {courses.length} {courses.length === 1 ? 'درس' : 'دروس'}
                        </span>
                    </div>
                </div>
                <div className={styles.wave}></div>
            </div>

            <div className="container">
                {courses.length === 0 ? (
                    <div className={styles.grid}>
                        <div className={styles.empty}>
                            <span>📚</span>
                            <h3>لا توجد دروس في هذه الفئة بعد</h3>
                            <p>سيتم إضافة الدروس قريبًا</p>
                        </div>
                    </div>
                ) : (
                    <CategoryCoursesSearch courses={courses} />
                )}
            </div>
        </div>
    );
}