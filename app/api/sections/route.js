import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getAdminSession } from '@/lib/auth';

export async function POST(request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

  try {
    const { title, content, course_id, order_index } = await request.json();

    if (!title || !content || !course_id) {
      return NextResponse.json({ error: 'العنوان والمحتوى والدرس مطلوبة' }, { status: 400 });
    }

    const orderResult = await query(
      'SELECT COALESCE(MAX(order_index), -1) + 1 as next_order FROM sections WHERE course_id = $1',
      [course_id]
    );
    const nextOrder = order_index ?? orderResult.rows[0].next_order;

    const result = await query(
      `INSERT INTO sections (title, content, course_id, order_index)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [title, content, course_id, nextOrder]
    );

    return NextResponse.json({ section: result.rows[0] }, { status: 201 });
  } catch (error) {
    console.error('POST section error:', error);
    return NextResponse.json({ error: 'خطأ في إنشاء المقطع' }, { status: 500 });
  }
}
