import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

  try {
    const formData = await request.formData();
    const file = formData.get('pdf');

    if (!file || file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'يرجى رفع ملف PDF صحيح' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'pdfs');
    await mkdir(uploadDir, { recursive: true });

    const filename = `course-${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
    const filepath = path.join(uploadDir, filename);
    await writeFile(filepath, buffer);

    const url = `/uploads/pdfs/${filename}`;
    return NextResponse.json({ url }, { status: 201 });
  } catch (error) {
    console.error('PDF upload error:', error);
    return NextResponse.json({ error: 'فشل رفع الملف' }, { status: 500 });
  }
}