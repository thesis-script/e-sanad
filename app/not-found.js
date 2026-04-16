import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', textAlign: 'center',
      padding: '40px', fontFamily: 'Cairo, sans-serif', direction: 'rtl',
      background: 'var(--bg)'
    }}>
      <div style={{ fontSize: '5rem', marginBottom: '24px' }}>📖</div>
      <h1 style={{ fontFamily: 'Scheherazade New, serif', fontSize: '2.5rem', color: 'var(--primary)', marginBottom: '12px' }}>
        الصفحة غير موجودة
      </h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '32px', fontSize: '1rem' }}>
        الصفحة التي تبحث عنها غير موجودة أو تم نقلها
      </p>
      <Link href="/" style={{
        display: 'inline-flex', alignItems: 'center', gap: '8px',
        padding: '12px 28px', background: 'var(--accent)', color: 'var(--primary)',
        borderRadius: '9999px', fontWeight: 700, textDecoration: 'none',
        transition: 'all 0.2s'
      }}>
        العودة للرئيسية
      </Link>
    </div>
  );
}
