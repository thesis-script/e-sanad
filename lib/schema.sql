-- Database Schema for Arabic Literature E-Learning Platform

-- Admins table
CREATE TABLE IF NOT EXISTS admins (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  slug VARCHAR(255) UNIQUE NOT NULL,
  color VARCHAR(7) DEFAULT '#10b981',
  icon VARCHAR(50) DEFAULT 'BookOpen',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Courses table
CREATE TABLE IF NOT EXISTS courses (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  slug VARCHAR(255) UNIQUE NOT NULL,
  category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  cover_color VARCHAR(7) DEFAULT '#3b82f6',
  level VARCHAR(50) DEFAULT 'بكالوريا',
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sections / Lessons table
CREATE TABLE IF NOT EXISTS sections (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_courses_category_id ON courses(category_id);
CREATE INDEX IF NOT EXISTS idx_sections_course_id ON sections(course_id);
CREATE INDEX IF NOT EXISTS idx_courses_slug ON courses(slug);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);

-- Seed default admin (password: admin123)
INSERT INTO admins (username, email, password_hash)
VALUES ('admin', 'admin@adab.dz', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj2gpYCGGe6i')
ON CONFLICT (username) DO NOTHING;

-- Seed sample categories
INSERT INTO categories (name, description, slug, color, icon) VALUES
  ('الشعر العربي', 'دراسة أشكال الشعر العربي الكلاسيكي والحديث وأبرز شعرائه', 'shir-arabi', '#f59e0b', 'Feather'),
  ('النثر والمقالة', 'فنون النثر الأدبي والمقالة الصحفية والأدبية', 'nathr-maqala', '#10b981', 'FileText'),
  ('الرواية والقصة', 'تحليل الروايات والقصص القصيرة في الأدب العربي', 'riwaya-qissa', '#3b82f6', 'BookOpen'),
  ('المسرح العربي', 'نشأة المسرح العربي وأبرز أعلامه', 'masrah-arabi', '#8b5cf6', 'Theater'),
  ('البلاغة والنقد', 'علوم البلاغة والنقد الأدبي', 'balagha-naqd', '#ef4444', 'Award')
ON CONFLICT (slug) DO NOTHING;
