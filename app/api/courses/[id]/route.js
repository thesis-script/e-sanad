import { notFound } from 'next/navigation';
import { query } from '@/lib/db';
import Link from 'next/link';
import styles from './page.module.css';

// Alternative method: Fetch directly from API
async function getCourseData(id) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/courses/${id}`, {
      cache: 'no-store', // Disable caching during development
    });
    
    if (!response.ok) {
      return null;
    }
    
    const { course } = await response.json();
    return { course };
  } catch (error) {
    console.error('Error fetching course:', error);
    return null;
  }
}

async function getData(id) {
  try {
    // Using direct database query (alternative method)
    const numericId = parseInt(id);
    if (isNaN(numericId)) return null;

    const courseRes = await query(`
      SELECT co.*, c.name as category_name, c.slug as category_slug, c.color as category_color
      FROM courses co
      LEFT JOIN categories c ON co.category_id = c.id
      WHERE co.id = $1 AND co.is_published = true
    `, [numericId]);

    if (courseRes.rows.length === 0) return null;
    const course = courseRes.rows[0];

    const sectionsRes = await query(
      'SELECT * FROM sections WHERE course_id = $1 ORDER BY order_index ASC',
      [course.id]
    );
    course.sections = sectionsRes.rows;

    return { course };
  } catch (error) {
    console.error('Error fetching course:', error);
    return null;
  }
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const data = await getData(id);
  if (!data) return { title: 'غير موجود' };
  return { title: `${data.course.title} — الأدب العربي` };
}

export default async function CourseDetailPage({ params }) {
  const { id } = await params;
  const data = await getData(id);
  
  if (!data) notFound();
  
  const { course } = data;

  return (
    <div className={styles.page}>
      <div className={styles.header} style={{ '--color': course.cover_color }}>
        <div className="container">
          <nav className={styles.breadcrumb}>
            <Link href="/">الرئيسية</Link>
            <span>/</span>
            <Link href={`/categories/${course.category_slug}`}>{course.category_name}</Link>
            <span>/</span>
            <span>{course.title}</span>
          </nav>
          
          <div className={styles.courseHeader}>
            <div className={styles.courseMeta}>
              {course.category_name && (
                <Link 
                  href={`/categories/${course.category_slug}`} 
                  className={styles.catTag} 
                  style={{ color: course.category_color, background: `${course.category_color}18` }}
                >
                  {course.category_name}
                </Link>
              )}
              <span className={styles.levelTag}>{course.level}</span>
            </div>
            
            <h1>{course.title}</h1>
            {course.description && <p className={styles.description}>{course.description}</p>}
            
            <div className={styles.stats}>
              <span>📚 {course.sections.length} {course.sections.length === 1 ? 'مقطع' : 'مقاطع'}</span>
            </div>
          </div>
        </div>
        
        <div className={styles.wave}>
          <svg viewBox="0 0 1440 60" preserveAspectRatio="none" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 60L720 20L1440 60V0H0V60Z" fill="white"/>
          </svg>
        </div>
      </div>

      <div className="container">
        <div className={styles.sectionsContainer}>
          {course.sections.length === 0 ? (
            <div className={styles.empty}>
              <span>📝</span>
              <h3>لا توجد محتوى بعد</h3>
              <p>سيتم إضافة المحتوى قريباً</p>
            </div>
          ) : (
            <div className={styles.sectionsList}>
              {course.sections.map((section, index) => (
                <div key={section.id} className={styles.sectionCard}>
                  <div className={styles.sectionHeader}>
                    <span 
                      className={styles.sectionNumber} 
                      style={{ background: `${course.cover_color}18`, color: course.cover_color }}
                    >
                      {index + 1}
                    </span>
                    <h2 className={styles.sectionTitle}>{section.title}</h2>
                  </div>
                  <div 
                    className={styles.sectionContent}
                    dangerouslySetInnerHTML={{ __html: section.content }} 
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}