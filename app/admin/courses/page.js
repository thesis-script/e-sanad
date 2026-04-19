import { query } from '@/lib/db';
import CoursesClient from './CoursesClient';

export const metadata = { title: 'إدارة الدروس' };

async function getData() {
  try {
    const [coursesRes, catsRes] = await Promise.all([
      query(`SELECT co.*, c.name as category_name, c.color as category_color,
             COUNT(s.id) as section_count
             FROM courses co
             LEFT JOIN categories c ON co.category_id = c.id
             LEFT JOIN sections s ON s.course_id = co.id
             GROUP BY co.id, c.name, c.color
             ORDER BY co.created_at DESC`),
      query('SELECT id, name, color FROM categories ORDER BY name'),
    ]);
    return { courses: coursesRes.rows, categories: catsRes.rows };
  } catch { return { courses: [], categories: [] }; }
}

export default async function AdminCoursesPage() {
  const { courses, categories } = await getData();
  return <CoursesClient initialCourses={courses} categories={categories} />;
}
