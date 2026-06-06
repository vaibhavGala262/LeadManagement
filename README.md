# LeadFlow CRM

A modern, production-quality Lead Management CRM built with Next.js 15, TypeScript, PostgreSQL, and Prisma. Designed to help startups manage their sales pipeline with an intuitive dashboard and powerful lead tracking features.

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript (strict mode)
- **Database:** PostgreSQL via Neon
- **ORM:** Prisma 7
- **Styling:** Tailwind CSS v4
- **UI Library:** shadcn/ui (Radix primitives)
- **Charts:** Recharts
- **Forms:** React Hook Form + Zod validation
- **Tables:** TanStack Table
- **Testing:** Vitest + React Testing Library

## Features

### Dashboard
- Statistics cards showing pipeline overview (Total, New, Qualified, Converted, Lost)
- Interactive pie chart showing lead distribution by status
- Recent leads list with quick status glance
- Loading skeletons and empty states

### Lead Management
- Full CRUD operations (Create, Read, Update, Delete)
- Search by name, email, or company
- Filter by status
- Sortable columns (name, createdAt)
- Paginated results
- Quick status update via dropdown
- Responsive design for mobile and desktop

### API
- `GET /api/leads` - List with search, filter, pagination, sorting
- `POST /api/leads` - Create lead with validation
- `PUT /api/leads/[id]` - Update lead or change status
- `DELETE /api/leads/[id]` - Delete lead

### UX
- Success/error toast notifications via Sonner
- Loading skeletons
- Empty states with helpful CTAs
- Confirmation dialogs for destructive actions
- Modern, clean SaaS design with proper typography and spacing

## Screenshots

> Screenshots coming soon. Run the project locally to see the full UI.

## Project Structure

```
├── prisma/
│   ├── schema.prisma          # Database schema
│   ├── seed.ts                # 20 demo leads
│   └── migrations/            # Database migrations
├── src/
│   ├── app/
│   │   ├── (dashboard)/       # Dashboard layout & pages
│   │   │   ├── page.tsx       # Dashboard home
│   │   │   ├── layout.tsx     # Sidebar layout
│   │   │   └── leads/
│   │   │       └── page.tsx   # Leads management page
│   │   ├── api/leads/
│   │   │   ├── route.ts       # GET & POST /api/leads
│   │   │   └── [id]/route.ts  # GET, PUT, DELETE /api/leads/:id
│   │   ├── layout.tsx         # Root layout
│   │   └── globals.css        # Global styles
│   ├── components/
│   │   ├── ui/                # shadcn/ui components
│   │   ├── layout/            # Header, Sidebar
│   │   ├── dashboard/         # Stats cards, Charts
│   │   └── leads/             # Table, Form, Dialogs
│   ├── hooks/
│   │   └── use-leads.ts       # Lead data fetching hook
│   ├── lib/
│   │   ├── prisma.ts          # Prisma client singleton
│   │   ├── validations.ts     # Zod schemas
│   │   └── utils.ts           # Utility functions
│   └── generated/prisma/      # Generated Prisma client
├── tests/
│   ├── setup.ts               # Test setup
│   ├── api/leads.test.ts      # API + validation tests
│   └── components/            # Component tests
│       └── lead-form.test.tsx
├── vitest.config.ts
├── .env.example
└── package.json
```

## Setup

### Prerequisites

- Node.js 18+
- PostgreSQL database (recommended: [Neon](https://neon.tech))
- npm or yarn

### 1. Clone and install

```bash
git clone https://github.com/vaibhavGala262/LeadManagement.git
cd LeadManagement
npm install
```

### 2. Environment Variables

```bash
cp .env.example .env
```

Edit `.env` and set your `DATABASE_URL`:

```
DATABASE_URL="postgresql://user:password@ep-example-123456.us-east-2.aws.neon.tech/neondb?sslmode=require"
```

### 3. Database Migration

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# Seed with 20 demo leads
npm run db:seed
```

### 4. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Run Tests

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch
```

## Deployment

### Frontend (Vercel)

```bash
npm i -g vercel
vercel login
vercel
```

Set environment variables in Vercel dashboard:
- `DATABASE_URL` - your Neon PostgreSQL connection string

### Database (Neon)

1. Go to [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string
4. Set as `DATABASE_URL` in Vercel environment variables
5. Run migrations: `npx prisma migrate deploy`

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm start` | Start production server |
| `npm test` | Run tests |
| `npm run lint` | Lint code |
| `npm run typecheck` | TypeScript check |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:migrate` | Run database migrations |
| `npm run db:seed` | Seed database |
| `npm run db:studio` | Open Prisma Studio |

## API Reference

### GET /api/leads

Query parameters:
| Param | Type | Description |
|-------|------|-------------|
| `page` | number | Page number (default: 1) |
| `limit` | number | Items per page (default: 10) |
| `q` | string | Search query (name, email, company) |
| `status` | string | Filter by status |
| `sortBy` | string | Sort field (name, email, company, status, createdAt) |
| `order` | asc\|desc | Sort order |

### POST /api/leads

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1 (555) 123-4567",
  "company": "Acme Inc",
  "status": "NEW",
  "notes": "Optional notes"
}
```

## License

MIT
