# ✡ Beit HaTzaddik — Seminario Virtual

Plataforma de formación espiritual integrada que combina teología reformada, tradición judía y psicología profunda.

## Stack Tecnológico

- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Backend**: Next.js API Routes
- **Base de datos**: PostgreSQL + Prisma ORM
- **Auth**: NextAuth.js
- **Email**: Resend
- **Almacenamiento**: Cloudflare R2 (PDFs, videos)
- **Deploy**: Vercel + Railway

## Módulos

| Módulo | Descripción |
|--------|-------------|
| 📖 Aula Virtual | Cursos, lecciones y evaluaciones |
| 📚 Biblioteca Sagrada | Textos hebreos, comentarios y fuentes reformadas |
| 🕊 Comunidad | Foro de discusión y hevruta virtual |
| 🎓 Dashboard | Seguimiento de progreso y certificaciones |

## Instalación

```bash
# 1. Clonar repositorio
git clone https://github.com/borisMayer/beit-hatzaddik.git
cd beit-hatzaddik

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus credenciales

# 4. Inicializar base de datos
npx prisma migrate dev

# 5. Correr en desarrollo
npm run dev
```

## Roles de Usuario

- **Tzaddik** (Admin): Control total del seminario
- **Estudiante**: Acceso a cursos y comunidad
- **Visitante**: Solo lectura de contenido público

## Roadmap

- [x] Fase I: Estructura base y autenticación
- [ ] Fase II: Video streaming y matrículas
- [ ] Fase III: IA para consulta de textos sagrados

---

*בֵּית הַצַּדִּיק — Casa del Justo*
