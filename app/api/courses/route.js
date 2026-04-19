import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getAdminSession } from '@/lib/auth';
import { generateSlug } from '@/lib/utils';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('category_id');
    const categorySlug = searchParams.get('category_slug');

    let sql = `
      SELECT co.*, c.name as category_name, c.slug as category_slug, c.color as category_color,
             COUNT(s.id) as section_count
      FROM courses co
      LEFT JOIN categories c ON co.category_id = c.id
      LEFT JOIN sections s ON s.course_id = co.id
    `;
    const values = [];

    if (categoryId) {
      sql += ` WHERE co.category_id = $1`;
      values.push(categoryId);
    } else if (categorySlug) {
      sql += ` WHERE c.slug = $1`;
      values.push(categorySlug);
    }

    sql += ` GROUP BY co.id, c.name, c.slug, c.color ORDER BY co.created_at DESC`;

    const result = await query(sql, values);
    return NextResponse.json({ courses: result.rows });
  } catch (error) {
    console.error('GET courses error:', error);
    return NextResponse.json({ error: 'خطأ في جلب الدروس' }, { status: 500 });
  }
}

export async function POST(request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

  try {
    const { title, description, category_id, cover_color, level, is_published, pdf_url } = await request.json();


    if (!title || !category_id) {
      return NextResponse.json({ error: 'العنوان والفئة مطلوبان' }, { status: 400 });
    }

    const slug = generateSlug(title);

    const result = await query(
      `INSERT INTO courses (title, description, slug, category_id, cover_color, level, is_published, pdf_url)
   VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [title, description || '', slug, category_id, cover_color || '#3b82f6', level || 'بكالوريا', is_published !== false, pdf_url || null]
    );

    return NextResponse.json({ course: result.rows[0] }, { status: 201 });
  } catch (error) {
    console.error('POST course error:', error);
    if (error.code === '23505') {
      return NextResponse.json({ error: 'هذا الدرس موجود مسبقاً' }, { status: 409 });
    }
    return NextResponse.json({ error: 'خطأ في إنشاء الدرس' }, { status: 500 });
  }
}
