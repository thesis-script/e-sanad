import { redirect } from 'next/navigation';
import { getAdminSession } from '@/lib/auth';
import LoginForm from './LoginForm';
import styles from './page.module.css';

export const metadata = { title: 'تسجيل الدخول — الأدب العربي' };

export default async function LoginPage() {
  const session = await getAdminSession();
  if (session) redirect('/admin');

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.cardTop}>
          <div className={styles.logo}>
            <span>📚</span>
          </div>
          <h1 className={styles.title}>الأدب العربي</h1>
          <p className={styles.sub}>لوحة الإدارة</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}