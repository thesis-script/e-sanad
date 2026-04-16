import AdminSidebar from '@/components/admin/AdminSidebar';
import { getAdminSession } from '@/lib/auth';
import styles from './layout.module.css';

export const metadata = { title: 'لوحة الإدارة — الأدب العربي' };

export default async function AdminLayout({ children }) {
  // This layout wraps all /admin/* pages
  // Middleware already handles redirect for unauthenticated users
  // Login page gets this layout too but won't show sidebar since session is null
  const session = await getAdminSession();

  if (!session) {
    // Login page — render without sidebar
    return <>{children}</>;
  }

  return (
    <div className={styles.layout}>
      <AdminSidebar admin={session} />
      <main className={styles.main}>{children}</main>
    </div>
  );
}
