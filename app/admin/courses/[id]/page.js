import { notFound } from 'next/navigation';
import { query } from '@/lib/db';
import AdminCourseDetail from './AdminCourseDetail';

async function getData(id) {
  try {
    const courseRes = await query(`
      SELECT co.*, c.name as category_name, c.slug as category_slug, c.color as category_color
      FROM courses co
      LEFT JOIN categories c ON co.category_id = c.id
      WHERE co.id = $1
    `, [id]);

    if (courseRes.rows.length === 0) return null;
    const course = courseRes.rows[0];

    const sectionsRes = await query(
      'SELECT * FROM sections WHERE course_id = $1 ORDER BY order_index ASC',
      [course.id]
    );
    course.sections = sectionsRes.rows;

    const catsRes = await query('SELECT id, name, color FROM categories ORDER BY name');

    return { course, categories: catsRes.rows };
  } catch { return null; }
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const data = await getData(id);
  if (!data) return { title: 'غير موجود' };
  return { title: `${data.course.title} — الإدارة` };
}

export default async function AdminCourseDetailPage({ params }) {
  const { id } = await params;
  const data = await getData(id);
  if (!data) notFound();
  return <AdminCourseDetail course={data.course} categories={data.categories} />;
}
