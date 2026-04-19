import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { query } from '@/lib/db';
import { signToken, setAuthCookie } from '@/lib/auth';

export async function POST(request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ error: 'اسم المستخدم وكلمة المرور مطلوبان' }, { status: 400 });
    }

    const result = await query(
      'SELECT * FROM admins WHERE username = $1 OR email = $1',
      [username]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'بيانات الدخول غير صحيحة' }, { status: 401 });
    }

    const admin = result.rows[0];
    const passwordMatch = await bcrypt.compare(password, admin.password_hash);

    if (!passwordMatch) {
      return NextResponse.json({ error: 'بيانات الدخول غير صحيحة' }, { status: 401 });
    }

    const token = signToken({ id: admin.id, username: admin.username, email: admin.email });
    const cookie = setAuthCookie(token);

    const response = NextResponse.json({
      success: true,
      admin: { id: admin.id, username: admin.username, email: admin.email },
    });

    response.cookies.set(cookie);
    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 });
  }
}
