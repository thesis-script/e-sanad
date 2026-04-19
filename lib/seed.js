/**
 * Database seeder - run with: node lib/seed.js
 * Reads DATABASE_URL from .env.local automatically (no dotenv needed)
 */
const fs = require('fs');
const path = require('path');

// Manually parse .env.local
function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env.local');
  if (!fs.existsSync(envPath)) {
    console.error('❌ .env.local not found. Copy .env.example to .env.local and fill in your values.');
    process.exit(1);
  }
  const lines = fs.readFileSync(envPath, 'utf8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
    if (!process.env[key]) process.env[key] = val;
  }
}

loadEnv();

const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL is not set in .env.local');
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL.includes('localhost') ? false : { rejectUnauthorized: false },
});

async function seed() {
  const client = await pool.connect();
  try {
    console.log('🌱 Creating tables...');

    await client.query(`
      CREATE TABLE IF NOT EXISTS admins (
        id SERIAL PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        slug VARCHAR(255) UNIQUE NOT NULL,
        color VARCHAR(7) DEFAULT '#10b981',
        icon VARCHAR(50) DEFAULT 'BookOpen',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS courses (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        slug VARCHAR(255) UNIQUE NOT NULL,
        category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
        cover_color VARCHAR(7) DEFAULT '#3b82f6',
        level VARCHAR(50) DEFAULT 'بكالوريا',
        is_published BOOLEAN DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS sections (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
        order_index INTEGER DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_courses_category_id ON courses(category_id);
      CREATE INDEX IF NOT EXISTS idx_sections_course_id ON sections(course_id);
    `);
    console.log('✅ Tables created');

    // Admin
    const hash = await bcrypt.hash('admin123', 12);
    await client.query(`
      INSERT INTO admins (username, email, password_hash)
      VALUES ('admin', 'admin@adab.dz', $1)
      ON CONFLICT (username) DO NOTHING
    `, [hash]);
    console.log('✅ Admin created  →  username: admin  |  password: admin123');

    // Categories
    await client.query(`
      INSERT INTO categories (name, description, slug, color, icon) VALUES
        ('الشعر العربي',   'دراسة الشعر العربي الكلاسيكي والحديث وأبرز شعرائه',           'shir-arabi',   '#f59e0b', 'Feather'),
        ('النثر والمقالة', 'فنون النثر الأدبي والمقالة الصحفية والأدبية',                   'nathr-maqala', '#10b981', 'FileText'),
        ('الرواية والقصة', 'تحليل الروايات والقصص القصيرة في الأدب العربي',                 'riwaya-qissa', '#3b82f6', 'BookOpen'),
        ('المسرح العربي',  'نشأة المسرح العربي وأبرز أعلامه وتطوره عبر العصور',            'masrah-arabi', '#8b5cf6', 'Theater'),
        ('البلاغة والنقد', 'علوم البلاغة والنقد الأدبي وتطبيقاتهما على النصوص',             'balagha-naqd', '#ef4444', 'Award')
      ON CONFLICT (slug) DO NOTHING
    `);
    
    // Fetch all categories
    const catsResult = await client.query(`SELECT id, slug FROM categories`);
    console.log('✅ Categories seeded (' + catsResult.rowCount + ' total)');

    // Sample course
    const shirCat = catsResult.rows.find(r => r.slug === 'shir-arabi');
    if (shirCat) {
      const courseRes = await client.query(`
        INSERT INTO courses (title, description, slug, category_id, cover_color, level)
        VALUES (
          'مدخل إلى الشعر الجاهلي',
          'دراسة شاملة لأهم خصائص الشعر الجاهلي وأبرز شعرائه ومعلقاتهم',
          'madkhal-shir-jahili', $1, '#f59e0b', 'بكالوريا'
        )
        ON CONFLICT (slug) DO NOTHING RETURNING id
      `, [shirCat.id]);

      if (courseRes.rows[0]) {
        const cid = courseRes.rows[0].id;
        await client.query(`
          INSERT INTO sections (title, content, course_id, order_index) VALUES
          (
            'تعريف الشعر الجاهلي وخصائصه',
            E'الشعر الجاهلي هو الشعر الذي قيل قبل الإسلام بنحو مئة وخمسين عامًا تقريبًا، وهو يمثّل أقدم الآثار الأدبية الموثّقة في اللغة العربية.\n\nيُعدّ الشعر الجاهلي من أرقى الآداب الإنسانية قيمةً وأعمقها معنىً، إذ صوّر حياة العرب بكل تفاصيلها من صراع وكرم وحب وفخر ورثاء.\n\nمن أبرز خصائصه:\n• الفخر بالنسب والقبيلة\n• وصف الطبيعة الصحراوية بدقة\n• الغزل والنسيب في مطالع القصائد\n• الرثاء وإحياء ذكرى الأموات\n• الحكمة والأمثال السائرة',
            $1, 0
          ),
          (
            'أبرز شعراء العصر الجاهلي',
            E'تميّز العصر الجاهلي بعدد كبير من الشعراء الذين تركوا إرثًا أدبيًا خالدًا لا يزال يُدرَّس حتى اليوم.\n\nأبرزهم:\n\n١. امرؤ القيس (ت. 540م)\nلُقِّب بـ«ملك الشعراء» وهو أشهر شعراء الجاهلية على الإطلاق، صاحب أولى المعلقات السبع وأكثرها شهرة. عُرف بالغزل الجريء ووصف الطبيعة.\n\n٢. زهير بن أبي سُلمى\nشاعر الحكمة والسلام، أمضى سنوات في نظم قصيدته الشهيرة «معلقة زهير» التي تدعو إلى السلم ونبذ الحرب.\n\n٣. عنترة بن شداد\nالفارس الشاعر، اشتُهر بقصيدته التي تمزج بين البطولة والغزل برفيقته عبلة.\n\n٤. طرفة بن العبد\nشاعر الشباب، مات في ريعان شبابه وترك معلقة فيها حكمة بالغة وفلسفة في الحياة.',
            $1, 1
          ),
          (
            'المعلقات السبع',
            E'المعلقات هي أشهر قصائد الشعر العربي الجاهلي وأطولها وأجودها، وقد سُمّيت بهذا الاسم لأنها كانت تُعلَّق على أستار الكعبة المشرّفة تكريمًا لشعرائها.\n\nتضم سبع قصائد لسبعة شعراء:\n١. امرؤ القيس — تبدأ بـ«قفا نبكِ من ذكرى حبيبٍ ومنزلِ»\n٢. طرفة بن العبد — تبدأ بـ«لخولةَ أطلالٌ ببُرقةِ ثَهمَدِ»\n٣. زهير بن أبي سُلمى — تبدأ بـ«أمِن أمّ أوفى دِمنةٌ لم تكلَّمِ»\n٤. لبيد بن ربيعة — تبدأ بـ«عفتِ الديارُ محلُّها فمقامُها»\n٥. عمرو بن كلثوم — تبدأ بـ«أَلا هُبّي بِصَحنكِ فاصبحينا»\n٦. عنترة بن شداد — تبدأ بـ«هل غادرَ الشعراءُ من متردَّمِ»\n٧. الحارث بن حلزة — تبدأ بـ«آذَنَتنا ببَينها أسماءُ»\n\nتمتاز هذه القصائد بطول نَفَسها الشعري وعمق معانيها وجزالة ألفاظها وقوة أساليبها.',
            $1, 2
          )
        `, [cid]);
        console.log('✅ Sample course + 3 sections seeded');
      }
    }

    // Second sample course
    const nathrCat = catsResult.rows.find(r => r.slug === 'nathr-maqala');
    if (nathrCat) {
      const courseRes2 = await client.query(`
        INSERT INTO courses (title, description, slug, category_id, cover_color, level)
        VALUES (
          'فن المقالة الأدبية',
          'دراسة فن المقالة الأدبية وخصائصها وأبرز كتّابها في الأدب العربي الحديث',
          'fan-maqala-adabiya', $1, '#10b981', 'بكالوريا'
        )
        ON CONFLICT (slug) DO NOTHING RETURNING id
      `, [nathrCat.id]);

      if (courseRes2.rows[0]) {
        const cid2 = courseRes2.rows[0].id;
        await client.query(`
          INSERT INTO sections (title, content, course_id, order_index) VALUES
          (
            'تعريف المقالة وأنواعها',
            E'المقالة قطعة نثرية محدودة الطول، تعالج موضوعًا واحدًا من زاوية معينة، وتعكس شخصية كاتبها وأسلوبه الخاص.\n\nأنواع المقالة:\n• المقالة الذاتية: يُبرز فيها الكاتب شخصيته وأحاسيسه\n• المقالة الموضوعية: تعتمد على المنطق والحجج والأدلة\n• المقالة النقدية: تتناول عملًا أدبيًا أو فكريًا بالتحليل والتقييم\n• المقالة الصحفية: تعالج قضايا اجتماعية وسياسية راهنة',
            $1, 0
          )
        `, [cid2]);
        console.log('✅ Second sample course seeded');
      }
    }

    console.log('\n🎉 Database ready! Open http://localhost:3000');
    console.log('   Admin panel: http://localhost:3000/admin');
    console.log('   Login: admin / admin123\n');

  } catch (err) {
    console.error('\n❌ Error:', err.message);
    if (err.message.includes('connect')) {
      console.error('   → Check your DATABASE_URL in .env.local');
      console.error('   → Make sure PostgreSQL is running');
    }
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
