import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getAdminSession } from '@/lib/auth';

export async function PUT(request, { params }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

  try {
    const { id } = await params;
    const { title, content, order_index } = await request.json();

    if (!title || !content) {
      return NextResponse.json({ error: 'العنوان والمحتوى مطلوبان' }, { status: 400 });
    }

    const result = await query(
      `UPDATE sections SET title=$1, content=$2, order_index=$3, updated_at=NOW()
       WHERE id=$4 RETURNING *`,
      [title, content, order_index ?? 0, id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'المقطع غير موجود' }, { status: 404 });
    }

    return NextResponse.json({ section: result.rows[0] });
  } catch (error) {
    return NextResponse.json({ error: 'خطأ في تحديث المقطع' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

  try {
    const { id } = await params;
    const result = await query('DELETE FROM sections WHERE id=$1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'المقطع غير موجود' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'خطأ في حذف المقطع' }, { status: 500 });
  }
}
