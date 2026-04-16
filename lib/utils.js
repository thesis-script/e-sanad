export function generateSlug(text) {
  // Handle Arabic and Latin text
  return text
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFFa-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || Date.now().toString();
}

export function formatDate(date) {
  return new Date(date).toLocaleDateString('ar-DZ', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export const CATEGORY_COLORS = [
  '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6',
  '#ef4444', '#06b6d4', '#f97316', '#84cc16',
];

export const COURSE_LEVELS = ['بكالوريا', 'متقدم', 'متوسط', 'مبتدئ'];
