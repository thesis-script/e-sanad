import Link from 'next/link';
import { query } from '@/lib/db';
import { getAdminSession } from '@/lib/auth';
import styles from './page.module.css';

async function getStats() {
  try {
    const [cats, courses, sections, recent] = await Promise.all([
      query('SELECT COUNT(*) FROM categories'),
      query('SELECT COUNT(*) FROM courses'),
      query('SELECT COUNT(*) FROM sections'),
      query(`SELECT co.title, co.slug, co.created_at, c.name as cat_name, c.color as cat_color
             FROM courses co LEFT JOIN categories c ON co.category_id = c.id
             ORDER BY co.created_at DESC LIMIT 5`),
    ]);
    return {
      categoryCount: parseInt(cats.rows[0].count),
      courseCount: parseInt(courses.rows[0].count),
      sectionCount: parseInt(sections.rows[0].count),
      recentCourses: recent.rows,
    };
  } catch { return { categoryCount: 0, courseCount: 0, sectionCount: 0, recentCourses: [] }; }
}

export default async function AdminDashboard() {
  const session = await getAdminSession();
  const stats = await getStats();

  const statCards = [
    { label: 'الفئات', value: stats.categoryCount, icon: '🗂️', color: '#860ca4', href: '/admin/categories' },
    { label: 'الدروس', value: stats.courseCount, icon: '📚', color: '#3A9AFF', href: '/admin/courses' },
    { label: 'المقاطع', value: stats.sectionCount, icon: '📝', color: '#10b981', href: '/admin/courses' },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>لوحة التحكم</h1>
          <p className={styles.subtitle}>مرحباً، {session?.username} 👋</p>
        </div>
      </div>

      <div className={styles.statsGrid}>
        {statCards.map(card => (
          <Link key={card.label} href={card.href} className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: `${card.color}18` }}>
              <span>{card.icon}</span>
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statValue} style={{ color: card.color }}>{card.value}</span>
              <span className={styles.statLabel}>{card.label}</span>
            </div>
            <span className={styles.statArrow} style={{ color: card.color }}>←</span>
          </Link>
        ))}
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>إجراءات سريعة</h2>
        <div className={styles.quickGrid}>
          {[
            { href: '/admin/categories', icon: '🗂️', title: 'إدارة الفئات', desc: 'إضافة وتعديل وحذف الفئات' },
            { href: '/admin/courses', icon: '📚', title: 'إدارة الدروس', desc: 'إضافة وتعديل وحذف الدروس والمقاطع' },
            { href: '/', target: '_blank', icon: '🌐', title: 'عرض الموقع', desc: 'مشاهدة الواجهة الأمامية للمنصة' },
          ].map(item => (
            <Link key={item.href} href={item.href} target={item.target} className={styles.quickCard}>
              <span className={styles.quickIcon}>{item.icon}</span>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </Link>
          ))}
        </div>
      </div>

      {stats.recentCourses.length > 0 && (
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>أحدث الدروس</h2>
            <Link href="/admin/courses" className="btn btn-ghost btn-sm">عرض الكل</Link>
          </div>
          <div className={styles.tableWrap}>
            <table>
              <thead>
                <tr><th>عنوان الدرس</th><th>الفئة</th><th>تاريخ الإنشاء</th><th></th></tr>
              </thead>
              <tbody>
                {stats.recentCourses.map((course, idx) => (
                  <tr key={course.id ?? idx}>
                    <td className={styles.courseName}>{course.title}</td>
                    <td><span className={styles.catTag} style={{ color: course.cat_color, background: `${course.cat_color}18` }}>{course.cat_name}</span></td>
                    <td className={styles.date}>{new Date(course.created_at).toLocaleDateString('ar-DZ')}</td>
                    <td><Link href={`/courses/${course.id}`} target="_blank" className="btn btn-ghost btn-sm">عرض</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )
      }
    </div >
  );
}
