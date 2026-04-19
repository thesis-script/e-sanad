import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getAdminSession } from '@/lib/auth';
import { generateSlug } from '@/lib/utils';

export async function GET() {
  try {
    const result = await query(`
      SELECT c.*, COUNT(co.id) as course_count
      FROM categories c
      LEFT JOIN courses co ON co.category_id = c.id
      GROUP BY c.id
      ORDER BY c.created_at DESC
    `);
    return NextResponse.json({ categories: result.rows });
  } catch (error) {
    console.error('GET categories error:', error);
    return NextResponse.json({ error: 'خطأ في جلب الفئات' }, { status: 500 });
  }
}

export async function POST(request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

  try {
    const { name, description, color, icon } = await request.json();
    if (!name) return NextResponse.json({ error: 'اسم الفئة مطلوب' }, { status: 400 });

    const slug = generateSlug(name);

    const result = await query(
      `INSERT INTO categories (name, description, slug, color, icon)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [name, description || '', slug, color || '#10b981', icon || 'BookOpen']
    );

    return NextResponse.json({ category: result.rows[0] }, { status: 201 });
  } catch (error) {
    console.error('POST category error:', error);
    if (error.code === '23505') {
      return NextResponse.json({ error: 'هذا الفئة موجود مسبقاً' }, { status: 409 });
    }
    return NextResponse.json({ error: 'خطأ في إنشاء الفئة' }, { status: 500 });
  }
}
