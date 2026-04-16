'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './LoginForm.module.css';

export default function LoginForm() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'خطأ في تسجيل الدخول'); return; }
      router.push('/admin');
      router.refresh();
    } catch {
      setError('تعذّر الاتصال بالخادم');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      {error && (
        <div className={styles.error}>
          <span>⚠️</span> {error}
        </div>
      )}

      <div className={styles.field}>
        <label className={styles.label}>اسم المستخدم</label>
        <input
          className={styles.input}
          type="text"
          placeholder="admin"
          value={form.username}
          onChange={e => setForm(p => ({ ...p, username: e.target.value }))}
          required
          autoComplete="username"
          suppressHydrationWarning
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label}>كلمة المرور</label>
        <div className={styles.passWrap}>
          <input
            className={styles.input}
            type={showPass ? 'text' : 'password'}
            placeholder="••••••••"
            value={form.password}
            onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
            required
            autoComplete="current-password"
            suppressHydrationWarning
          />
          <button
            type="button"
            className={styles.eyeBtn}
            onClick={() => setShowPass(v => !v)}
            tabIndex={-1}
            aria-label="إظهار كلمة المرور"
          >
            {showPass ? '🙈' : '👁️'}
          </button>
        </div>
      </div>

      <button type="submit" className={styles.submit} disabled={loading}>
        {loading ? (
          <><span className={styles.spinner} /> جارٍ الدخول...</>
        ) : 'دخول'}
      </button>
    </form>
  );
}