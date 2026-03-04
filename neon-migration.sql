-- ============================================
-- Beit HaTzaddik — Database Migration
-- Run this in Neon SQL Editor
-- ============================================

CREATE TYPE IF NOT EXISTS "Role" AS ENUM ('TZADDIK', 'STUDENT', 'VISITOR');

CREATE TABLE IF NOT EXISTS "User" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT,
  email TEXT UNIQUE NOT NULL,
  password TEXT,
  image TEXT,
  role "Role" NOT NULL DEFAULT 'STUDENT',
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "Course" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  "imageUrl" TEXT,
  published BOOLEAN NOT NULL DEFAULT false,
  "order" INT NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "Lesson" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "courseId" TEXT NOT NULL REFERENCES "Course"(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  "videoUrl" TEXT,
  "order" INT NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "Enrollment" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId" TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  "courseId" TEXT NOT NULL REFERENCES "Course"(id) ON DELETE CASCADE,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE("userId", "courseId")
);

CREATE TABLE IF NOT EXISTS "Progress" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId" TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  "lessonId" TEXT NOT NULL REFERENCES "Lesson"(id) ON DELETE CASCADE,
  completed BOOLEAN NOT NULL DEFAULT false,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE("userId", "lessonId")
);

CREATE TABLE IF NOT EXISTS "SacredText" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title TEXT NOT NULL,
  author TEXT,
  category TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'he',
  "fileUrl" TEXT,
  description TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "ForumPost" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId" TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  "courseId" TEXT REFERENCES "Course"(id),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "ForumComment" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "postId" TEXT NOT NULL REFERENCES "ForumPost"(id) ON DELETE CASCADE,
  "userId" TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================
-- Seed data inicial
-- ============================================

-- Tzaddik admin user (password: Tzaddik2026!)
INSERT INTO "User" (id, name, email, password, role) VALUES
  ('tzaddik-001', 'Tzaddik', 'boris@beit-hatzaddik.com', '$2b$10$placeholder', 'TZADDIK')
ON CONFLICT (email) DO NOTHING;

-- Cursos iniciales
INSERT INTO "Course" (id, title, description, category, published, "order") VALUES
  ('course-001', 'Introducción a la Cábala Reformada', 'Fundamentos del misticismo judío desde una perspectiva reformada', 'Mística', true, 1),
  ('course-002', 'Psicología del Alma: Logoterapia y Torá', 'Integración de Viktor Frankl con la sabiduría de la Torá', 'Psicología', true, 2),
  ('course-003', 'Teología Reformada y Tradición Judía', 'Diálogo entre Calvino y los grandes maestros del judaísmo', 'Teología', true, 3),
  ('course-004', 'Meditación y Contemplación Espiritual', 'Prácticas contemplativas basadas en la Cábala y la espiritualidad reformada', 'Práctica', true, 4)
ON CONFLICT (id) DO NOTHING;

-- Lecciones para el primer curso
INSERT INTO "Lesson" (id, "courseId", title, content, "order") VALUES
  ('lesson-001', 'course-001', 'El Ein Sof y la Creación', 'En el principio de toda comprensión cabalística se encuentra el concepto del Ein Sof — lo Infinito sin límites. Este concepto es fundamental para entender la naturaleza de Dios en la mística judía...', 1),
  ('lesson-002', 'course-001', 'Los Diez Sefirot', 'Las Sefirot son los atributos o emanaciones divinas a través de las cuales Ein Sof se revela y crea continuamente el mundo. Son diez en total y forman el Árbol de la Vida...', 2),
  ('lesson-003', 'course-001', 'El Tzimtzum: La Contracción Divina', 'El Tzimtzum es el acto primordial de contracción o retracción del Ein Sof para crear un espacio vacío en el que los mundos finitos pudieran existir...', 3)
ON CONFLICT (id) DO NOTHING;

-- Textos sagrados
INSERT INTO "SacredText" (id, title, author, category, language, description) VALUES
  ('text-001', 'Zohar — Libro del Esplendor', 'Rabi Shimon bar Yochai', 'Cábala', 'HE/ES', 'El texto central del misticismo judío, revelado en el siglo II y compilado en el XIII'),
  ('text-002', 'Institución de la Religión Cristiana', 'Juan Calvino', 'Teología Reformada', 'ES', 'Obra sistemática fundamental de la teología reformada'),
  ('text-003', 'El Hombre en Busca de Sentido', 'Viktor Frankl', 'Psicología', 'ES', 'Fundamento de la logoterapia y la psicología existencial'),
  ('text-004', 'Mesilat Yesharim — Camino de los Rectos', 'Ramchal', 'Misticismo', 'HE/ES', 'Guía ética y espiritual del Rabino Moshe Chaim Luzzatto'),
  ('text-005', 'Pirke Avot — Ética de los Padres', 'Múltiples autores', 'Talmud', 'HE/ES', 'Sabiduría ética de los grandes maestros del Talmud'),
  ('text-006', 'La Confesión de Westminster', 'Asamblea de Westminster', 'Teología Reformada', 'ES', 'Confesión de fe reformada del siglo XVII')
ON CONFLICT (id) DO NOTHING;

-- Post inicial del foro
INSERT INTO "ForumPost" (id, "userId", title, content) VALUES
  ('post-001', 'tzaddik-001', 'Bienvenidos a Beit HaTzaddik', 'Shalom a todos. Este es el espacio de encuentro de nuestra comunidad espiritual. Aquí estudiaremos juntos la sabiduría de la Torá, la profundidad de la teología reformada y la integración con la psicología del alma. Baruch HaShem.')
ON CONFLICT (id) DO NOTHING;

SELECT 'Migration completed successfully ✓' as status;
