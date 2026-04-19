import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getAdminSession } from '@/lib/auth';
import { generateSlug } from '@/lib/utils';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const result = await query('SELECT * FROM categories WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'الفئة غير موجود' }, { status: 404 });
    }
    return NextResponse.json({ category: result.rows[0] });
  } catch (error) {
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

  try {
    const { id } = await params;
    const { name, description, color, icon } = await request.json();
    if (!name) return NextResponse.json({ error: 'اسم الفئة مطلوب' }, { status: 400 });

    const slug = generateSlug(name);

    const result = await query(
      `UPDATE categories SET name=$1, description=$2, slug=$3, color=$4, icon=$5, updated_at=NOW()
       WHERE id=$6 RETURNING *`,
      [name, description || '', slug, color || '#10b981', icon || 'BookOpen', id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'الفئة غير موجود' }, { status: 404 });
    }

    return NextResponse.json({ category: result.rows[0] });
  } catch (error) {
    console.error('PUT category error:', error);
    return NextResponse.json({ error: 'خطأ في تحديث الفئة' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

  try {
    const { id } = await params;
    const result = await query('DELETE FROM categories WHERE id=$1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'الفئة غير موجود' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE category error:', error);
    return NextResponse.json({ error: 'خطأ في حذف الفئة' }, { status: 500 });
  }
}
