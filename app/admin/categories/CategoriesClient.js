'use client';
import { useState } from 'react';
import styles from './page.module.css';

const COLORS = ['#f59e0b','#10b981','#3b82f6','#8b5cf6','#ef4444','#06b6d4','#f97316','#84cc16'];
const ICONS = ['BookOpen','Feather','FileText','Theater','Award'];
const ICON_EMOJI = { BookOpen:'📖', Feather:'🪶', FileText:'📝', Theater:'🎭', Award:'🏛️' };

function Modal({ title, onClose, children }) {
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h3 style={{ fontFamily:'Cairo,sans-serif', fontSize:'1.05rem', fontWeight:700, color:'var(--primary)' }}>{title}</h3>
          <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', fontSize:'1.4rem', color:'var(--text-muted)', lineHeight:1 }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function CategoryForm({ initial={}, onSubmit, onCancel, loading, error }) {
  const [form, setForm] = useState({
    name: initial.name||'', description: initial.description||'',
    color: initial.color||'#10b981', icon: initial.icon||'BookOpen',
  });
  const set = (k,v) => setForm(p=>({...p,[k]:v}));
  return (
    <form onSubmit={e=>{e.preventDefault();onSubmit(form);}}>
      <div className="modal-body">
        {error && <div className="alert alert-error">{error}</div>}
        <div className="form-group">
          <label className="form-label">اسم الفئة *</label>
          <input className="form-input" value={form.name} onChange={e=>set('name',e.target.value)} placeholder="مثل: الشعر العربي" required/>
        </div>
        <div className="form-group">
          <label className="form-label">الوصف</label>
          <textarea className="form-textarea" value={form.description} onChange={e=>set('description',e.target.value)} placeholder="وصف مختصر..." rows={3}/>
        </div>
        <div className="form-group">
          <label className="form-label">اللون</label>
          <div className={styles.colorPicker}>
            {COLORS.map(c=>(
              <button key={c} type="button" className={`${styles.colorDot} ${form.color===c?styles.colorSelected:''}`}
                style={{background:c}} onClick={()=>set('color',c)}/>
            ))}
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">الأيقونة</label>
          <div className={styles.iconPicker}>
            {ICONS.map(ic=>(
              <button key={ic} type="button" className={`${styles.iconOption} ${form.icon===ic?styles.iconSelected:''}`} onClick={()=>set('icon',ic)}>
                {ICON_EMOJI[ic]}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="modal-footer">
        <button type="submit" className="btn btn-primary" disabled={loading}>{loading?'جارٍ الحفظ...':'حفظ الفئة'}</button>
        <button type="button" className="btn btn-ghost" onClick={onCancel}>إلغاء</button>
      </div>
    </form>
  );
}

export default function CategoriesClient({ initialCategories }) {
  const [categories, setCategories] = useState(initialCategories);
  const [showAdd, setShowAdd] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  function showToast(msg) { setToast(msg); setTimeout(()=>setToast(''),3000); }

  async function handleAdd(form) {
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/categories',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(form)});
      const data = await res.json();
      if(!res.ok){setError(data.error);return;}
      setCategories(p=>[{...data.category,course_count:0},...p]);
      setShowAdd(false); showToast('تم إنشاء الفئة ✓');
    } catch{setError('خطأ في الاتصال');}
    finally{setLoading(false);}
  }

  async function handleEdit(form) {
    setLoading(true); setError('');
    try {
      const res = await fetch(`/api/categories/${editItem.id}`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(form)});
      const data = await res.json();
      if(!res.ok){setError(data.error);return;}
      setCategories(p=>p.map(c=>c.id===editItem.id?{...data.category,course_count:c.course_count}:c));
      setEditItem(null); showToast('تم تحديث الفئة ✓');
    } catch{setError('خطأ في الاتصال');}
    finally{setLoading(false);}
  }

  async function handleDelete() {
    setLoading(true);
    try {
      await fetch(`/api/categories/${deleteItem.id}`,{method:'DELETE'});
      setCategories(p=>p.filter(c=>c.id!==deleteItem.id));
      setDeleteItem(null); showToast('تم الحذف ✓');
    } catch{}
    finally{setLoading(false);}
  }

  return (
    <div className={styles.page}>
      {toast && <div className={`alert alert-success ${styles.toast}`}>{toast}</div>}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>إدارة الفئات</h1>
          <p className={styles.sub}>{categories.length} فئة مُضاف</p>
        </div>
        <button className="btn btn-primary" onClick={()=>{setShowAdd(true);setError('');}}>+ إضافة فئة</button>
      </div>

      {categories.length===0 ? (
        <div className={styles.empty}>
          <span>🗂️</span><h3>لا توجد فئةات</h3>
          <p>أضف أول فئة لبدء تنظيم الدروس</p>
          <button className="btn btn-primary" onClick={()=>setShowAdd(true)}>+ إضافة فئة</button>
        </div>
      ) : (
        <div className={styles.grid}>
          {categories.map(cat=>(
            <div key={cat.id} className={styles.catCard}>
              <div className={styles.catColorBar} style={{background:cat.color}}></div>
              <div className={styles.catBody}>
                <div className={styles.catIconWrap} style={{background:`${cat.color}18`}}>
                  <span>{ICON_EMOJI[cat.icon]||'📚'}</span>
                </div>
                <div className={styles.catInfo}>
                  <h3 className={styles.catName}>{cat.name}</h3>
                  {cat.description&&<p className={styles.catDesc}>{cat.description}</p>}
                  <span className={styles.catCount} style={{color:cat.color}}>{cat.course_count} دروس</span>
                </div>
              </div>
              <div className={styles.catActions}>
                <button className="btn btn-ghost btn-sm" onClick={()=>{setEditItem(cat);setError('');}}>تعديل</button>
                <button className="btn btn-danger btn-sm" onClick={()=>setDeleteItem(cat)}>حذف</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAdd && <Modal title="إضافة فئة" onClose={()=>setShowAdd(false)}><CategoryForm onSubmit={handleAdd} onCancel={()=>setShowAdd(false)} loading={loading} error={error}/></Modal>}
      {editItem && <Modal title={`تعديل: ${editItem.name}`} onClose={()=>setEditItem(null)}><CategoryForm initial={editItem} onSubmit={handleEdit} onCancel={()=>setEditItem(null)} loading={loading} error={error}/></Modal>}
      {deleteItem && (
        <Modal title="تأكيد الحذف" onClose={()=>setDeleteItem(null)}>
          <div className="modal-body"><p style={{color:'var(--text-secondary)'}}>هل تريد حذف <strong>«{deleteItem.name}»</strong>؟ سيتم حذف جميع دروسه أيضاً.</p></div>
          <div className="modal-footer">
            <button className="btn btn-danger" onClick={handleDelete} disabled={loading}>{loading?'جارٍ الحذف...':'نعم، احذف'}</button>
            <button className="btn btn-ghost" onClick={()=>setDeleteItem(null)}>إلغاء</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
