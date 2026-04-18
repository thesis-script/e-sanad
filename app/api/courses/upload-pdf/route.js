import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';

export async function POST(request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

  try {
    const formData = await request.formData();
    const file = formData.get('pdf');

    if (!file || file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'يرجى رفع ملف PDF صحيح' }, { status: 400 });
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString('base64');
    const dataUri = `data:application/pdf;base64,${base64}`;

    // Upload to Cloudinary
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    const timestamp = Math.round(Date.now() / 1000);
    const folder = 'courses_pdfs';

    // Create signature
    const crypto = await import('crypto');
    const signatureString = `folder=${folder}&timestamp=${timestamp}&type=upload${apiSecret}`;
    const signature = crypto.default
      .createHash('sha256')
      .update(signatureString)
      .digest('hex');

    // Build form data for Cloudinary
    const cloudinaryForm = new FormData();
    cloudinaryForm.append('file', dataUri);
    cloudinaryForm.append('api_key', apiKey);
    cloudinaryForm.append('timestamp', timestamp.toString());
    cloudinaryForm.append('signature', signature);
    cloudinaryForm.append('folder', folder);
    cloudinaryForm.append('type', 'upload');
    cloudinaryForm.append('resource_type', 'raw'); // required for PDF

    const uploadRes = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/raw/upload`,
      { method: 'POST', body: cloudinaryForm }
    );

    const uploadData = await uploadRes.json();

    if (!uploadRes.ok || !uploadData.secure_url) {
      console.error('Cloudinary error:', uploadData);
      return NextResponse.json({ error: 'فشل رفع الملف إلى Cloudinary' }, { status: 500 });
    }

    return NextResponse.json({ url: uploadData.secure_url }, { status: 201 });
  } catch (error) {
    console.error('PDF upload error:', error);
    return NextResponse.json({ error: 'خطأ في رفع الملف' }, { status: 500 });
  }
}