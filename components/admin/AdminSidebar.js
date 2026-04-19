'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import styles from './AdminSidebar.module.css';

const NAV = [
  { href: '/admin', label: 'لوحة التحكم', icon: '🏠', exact: true },
  { href: '/admin/categories', label: 'الفئات', icon: '🗂️' },
  { href: '/admin/courses', label: 'الدروس', icon: '📚' },
];

export default function AdminSidebar({ admin }) {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/admin/login');
  }

  function isActive(href, exact) {
    return exact ? pathname === href : pathname.startsWith(href);
  }

  return (
    <>
      {/* Mobile Toggle */}
      <button className={styles.mobileToggle} onClick={() => setMobileOpen(!mobileOpen)}>
        ☰
      </button>

      {mobileOpen && <div className={styles.backdrop} onClick={() => setMobileOpen(false)} />}

      <aside className={`${styles.sidebar} ${mobileOpen ? styles.open : ''}`}>
        {/* Brand */}
        <div className={styles.brand}>
          <Link href="/" className={styles.brandLink}>
            <span className={styles.brandIcon}>📚</span>
            <div>
              <span className={styles.brandName}>الأدب العربي</span>
              <span className={styles.brandSub}>لوحة الإدارة</span>
            </div>
          </Link>
        </div>

        {/* Admin info */}
        <div className={styles.adminInfo}>
          <div className={styles.adminAvatar}>
            {admin?.username?.[0]?.toUpperCase() || 'A'}
          </div>
          <div>
            <span className={styles.adminName}>{admin?.username}</span>
            <span className={styles.adminRole}>أدمن</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className={styles.nav}>
          <span className={styles.navLabel}>القائمة الرئيسية</span>
          {NAV.map(({ href, label, icon, exact }) => (
            <Link
              key={href}
              href={href}
              className={`${styles.navLink} ${isActive(href, exact) ? styles.active : ''}`}
              onClick={() => setMobileOpen(false)}
            >
              <span className={styles.navIcon}>{icon}</span>
              <span>{label}</span>
            </Link>
          ))}
        </nav>

        <div className={styles.divider}></div>

        <nav className={styles.nav}>
          <span className={styles.navLabel}>الموقع</span>
          <Link href="/" target="_blank" className={styles.navLink}>
            <span className={styles.navIcon}>🌐</span>
            <span>عرض الموقع</span>
          </Link>
        </nav>

        {/* Logout */}
        <div className={styles.footer}>
          <button className={styles.logout} onClick={handleLogout} disabled={loggingOut}>
            <span>🚪</span>
            <span>{loggingOut ? 'جارٍ الخروج...' : 'تسجيل الخروج'}</span>
          </button>
        </div>
      </aside>
    </>
  );
}
