'use client';
import { useState } from 'react';
import Link from 'next/link';
import CourseFormModal from './CourseFormModal';
import SectionsModal from './SectionsModal';
import styles from './page.module.css';

function ConfirmModal({ title, message, onConfirm, onClose, loading }) {
  return (
    <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h3 style={{fontFamily:'Cairo,sans-serif',fontSize:'1.05rem',fontWeight:700,color:'var(--primary)'}}>{title}</h3>
          <button onClick={onClose} style={{background:'none',border:'none',cursor:'pointer',fontSize:'1.4rem',color:'var(--text-muted)',lineHeight:1}}>×</button>
        </div>
        <div className="modal-body"><p style={{color:'var(--text-secondary)'}}>{message}</p></div>
        <div className="modal-footer">
          <button className="btn btn-danger" onClick={onConfirm} disabled={loading}>{loading?'جارٍ الحذف...':'نعم، احذف'}</button>
          <button className="btn btn-ghost" onClick={onClose}>إلغاء</button>
        </div>
      </div>
    </div>
  );
}

export default function CoursesClient({ initialCourses, categories }) {
  const [courses, setCourses] = useState(initialCourses);
  const [showAdd, setShowAdd] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  const [sectionsItem, setSectionsItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState('');
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('');

  function showToast(msg) { setToast(msg); setTimeout(()=>setToast(''),3000); }

  async function handleAdd(form) {
    setLoading(true);
    try {
      const res = await fetch('/api/courses',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(form)});
      const data = await res.json();
      if(!res.ok) return { error: data.error };
      const cat = categories.find(c=>c.id==form.category_id);
      setCourses(p=>[{...data.course,category_name:cat?.name,category_color:cat?.color,section_count:0},...p]);
      setShowAdd(false); showToast('تم إنشاء الدرس ✓');
    } catch { return { error: 'خطأ في الاتصال' }; }
    finally { setLoading(false); }
  }

  async function handleEdit(form) {
    setLoading(true);
    try {
      const res = await fetch(`/api/courses/${editItem.id}`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(form)});
      const data = await res.json();
      if(!res.ok) return { error: data.error };
      const cat = categories.find(c=>c.id==form.category_id);
      setCourses(p=>p.map(c=>c.id===editItem.id?{...data.course,category_name:cat?.name,category_color:cat?.color,section_count:c.section_count}:c));
      setEditItem(null); showToast('تم تحديث الدرس ✓');
    } catch { return { error: 'خطأ في الاتصال' }; }
    finally { setLoading(false); }
  }

  async function handleDelete() {
    setLoading(true);
    try {
      await fetch(`/api/courses/${deleteItem.id}`,{method:'DELETE'});
      setCourses(p=>p.filter(c=>c.id!==deleteItem.id));
      setDeleteItem(null); showToast('تم حذف الدرس ✓');
    } catch {}
    finally { setLoading(false); }
  }

  function updateSectionCount(courseId, delta) {
    setCourses(p=>p.map(c=>c.id===courseId?{...c,section_count:Math.max(0,(parseInt(c.section_count)||0)+delta)}:c));
  }

  const filtered = courses.filter(c=>{
    const matchSearch = !search || c.title.includes(search)||(c.category_name||'').includes(search);
    const matchCat = !filterCat || c.category_id==filterCat;
    return matchSearch && matchCat;
  });

  return (
    <div className={styles.page}>
      {toast && <div className={`alert alert-success ${styles.toast}`}>{toast}</div>}

      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>إدارة الدروس</h1>
          <p className={styles.sub}>{courses.length} درس مُضاف</p>
        </div>
        <button className="btn btn-primary" onClick={()=>setShowAdd(true)}>+ إضافة درس</button>
      </div>

      <div className={styles.filters}>
        <input className={`form-input ${styles.searchInput}`} placeholder="🔍 ابحث عن درس..." value={search} onChange={e=>setSearch(e.target.value)}/>
        <select className={`form-select ${styles.catFilter}`} value={filterCat} onChange={e=>setFilterCat(e.target.value)}>
          <option value="">جميع الفئات</option>
          {categories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      {filtered.length===0 ? (
        <div className={styles.empty}>
          <span>📚</span>
          <h3>{search||filterCat?'لا توجد نتائج':'لا توجد دروس'}</h3>
          {!search&&!filterCat&&<button className="btn btn-primary" onClick={()=>setShowAdd(true)}>+ إضافة أول درس</button>}
        </div>
      ) : (
        <div className={styles.tableWrap}>
          <table>
            <thead>
              <tr><th>عنوان الدرس</th><th>الفئة</th><th>المستوى</th><th>المقاطع</th><th>الحالة</th><th>الإجراءات</th></tr>
            </thead>
            <tbody>
              {filtered.map(course=>(
                <tr key={course.id}>
                  <td>
                    <span className={styles.courseTitle}>{course.title}</span>
                    {course.description&&<span className={styles.courseDesc}>{course.description.substring(0,55)}{course.description.length>55?'...':''}</span>}
                  </td>
                  <td>{course.category_name&&<span className={styles.catBadge} style={{color:course.category_color,background:`${course.category_color}18`}}>{course.category_name}</span>}</td>
                  <td><span className={styles.levelBadge}>{course.level}</span></td>
                  <td>
                    <button className={styles.sectionsBtn} onClick={()=>setSectionsItem(course)}>
                      📝 {course.section_count}
                    </button>
                  </td>
                  <td><span className={`${styles.status} ${course.is_published?styles.published:styles.draft}`}>{course.is_published?'منشور':'مسودة'}</span></td>
                  <td>
                    <div className={styles.actions}>
                      <Link href={`/admin/courses/${course.id}`} className="btn btn-ghost btn-sm">تفاصيل</Link>
                      <button className="btn btn-ghost btn-sm" onClick={()=>setEditItem(course)}>تعديل</button>
                      <button className="btn btn-danger btn-sm" onClick={()=>setDeleteItem(course)}>حذف</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showAdd && <CourseFormModal categories={categories} onSubmit={handleAdd} onClose={()=>setShowAdd(false)} loading={loading} title="إضافة درس جديد"/>}
      {editItem && <CourseFormModal initial={editItem} categories={categories} onSubmit={handleEdit} onClose={()=>setEditItem(null)} loading={loading} title={`تعديل: ${editItem.title}`}/>}
      {deleteItem && <ConfirmModal title="تأكيد الحذف" message={`هل تريد حذف «${deleteItem.title}»؟ سيتم حذف جميع مقاطعه أيضاً.`} onConfirm={handleDelete} onClose={()=>setDeleteItem(null)} loading={loading}/>}
      {sectionsItem && <SectionsModal course={sectionsItem} onClose={()=>setSectionsItem(null)} onCountChange={delta=>updateSectionCount(sectionsItem.id,delta)}/>}
    </div>
  );
}
