import { query } from '@/lib/db';
import CategoriesClient from './CategoriesClient';

export const metadata = { title: 'إدارة الفئات' };

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

export default async function AdminCategoriesPage() {
  const categories = await getCategories();
  return <CategoriesClient initialCategories={categories} />;
}
