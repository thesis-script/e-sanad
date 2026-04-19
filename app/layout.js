import './globals.css';

export const metadata = {
  title: 'منصة السند في النصوص والنقد  - بكالوريا',
  description: 'منصة تعليمية متكاملة لمادة الأدب العربي لطلاب البكالوريا',
  keywords: 'أدب عربي, بكالوريا, شعر, نثر, رواية, مسرح, بلاغة',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
