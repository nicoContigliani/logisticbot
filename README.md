# LogisticBot - Logistics Management System

A modern, minimalist logistics management platform built with Next.js, featuring file parsing capabilities for XML, Excel, CSV, and CASL formats.

## Features

- **File Parsing**: Support for XML, Excel (.xlsx, .xls), CSV, and CASL file formats
- **Real-time Tracking**: Track shipments with automated status updates
- **Inventory Management**: Comprehensive inventory control with alerts
- **Analytics Dashboard**: Data visualization and reporting
- **Minimalist Design**: Blueprint-style UI for optimal user experience
- **High Performance**: Optimized for speed and efficiency

## Tech Stack

- **Frontend**: Next.js 14, React 19, Material-UI
- **Backend**: Next.js API Routes
- **Database**: MongoDB
- **Authentication**: Clerk
- **File Processing**: ExcelJS, PapaParse, xml2js
- **Authorization**: CASL
- **State Management**: Zustand
- **Styling**: CSS Variables with Blueprint theme

## Getting Started

### Prerequisites

- Node.js 18+ 
- MongoDB instance
- Clerk account for authentication

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd logisticbot
```

2. Install dependencies:
```bash
npm install
# or
pnpm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:
- MongoDB connection string
- Clerk authentication keys
- Supabase credentials (optional)

4. Run the development server:
```bash
npm run dev
# or
pnpm dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
logisticbot/
├── app/
│   ├── api/
│   │   ├── files/
│   │   │   └── upload/          # File upload API
│   │   └── logistics/           # Logistics CRUD API
│   ├── dashboard/               # Main dashboard page
│   ├── sign-in/                 # Authentication pages
│   ├── sign-up/
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Landing page
│   └── globals.css              # Global styles
├── lib/
│   ├── mongodb.ts               # MongoDB connection
│   ├── file-parsers.ts          # File parsing utilities
│   └── ability.ts               # CASL authorization
├── styles/
│   └── blueprint-theme.css      # Blueprint design system
├── components/                  # Reusable components
├── hooks/                       # Custom React hooks
├── store/                       # Zustand state stores
├── types/                       # TypeScript type definitions
└── public/                      # Static assets
```

## File Parsing

LogisticBot supports multiple file formats:

### Excel (.xlsx, .xls)
```typescript
import { parseExcel } from '@/lib/file-parsers';

const data = await parseExcel(file);
// Returns: { headers: string[], rows: Record<string, unknown>[] }
```

### CSV
```typescript
import { parseCSV } from '@/lib/file-parsers';

const data = await parseCSV(file);
```

### XML
```typescript
import { parseXML } from '@/lib/file-parsers';

const data = await parseXML(file);
```

### CASL
```typescript
import { parseCASL } from '@/lib/file-parsers';

const data = await parseCASL(file);
```

### Auto-detect Format
```typescript
import { parseFile } from '@/lib/file-parsers';

const data = await parseFile(file); // Automatically detects file type
```

## API Endpoints

### File Upload
- `POST /api/files/upload` - Upload a file
- `GET /api/files/upload?userId=<id>` - Get user's uploaded files

### Logistics Records
- `POST /api/logistics` - Create logistics records
- `GET /api/logistics?userId=<id>` - Get logistics records (with pagination)
- `PUT /api/logistics` - Update a logistics record
- `DELETE /api/logistics?id=<id>&userId=<userId>` - Delete a record

## Authorization (CASL)

LogisticBot uses CASL for fine-grained authorization:

```typescript
import { defineAbilityFor, ROLES } from '@/lib/ability';

// Define abilities for a user
const ability = defineAbilityFor({ role: ROLES.MANAGER, id: 'user-123' });

// Check permissions
if (ability.can('create', 'Shipment')) {
  // User can create shipments
}
```

### Roles
- **Admin**: Full access to all resources
- **Manager**: Can create/update shipments, export reports
- **Operator**: Can read/update shipments
- **Viewer**: Read-only access

## Design System

LogisticBot uses a minimalist blueprint-style design:

### CSS Variables
```css
:root {
  --primary-600: #2563eb;
  --neutral-800: #1e293b;
  --success-500: #22c55e;
  /* ... more variables */
}
```

### Components
- `.blueprint-card` - Card component with sketch border
- `.blueprint-btn` - Button styles
- `.blueprint-input` - Input field styles
- `.blueprint-table` - Table styles
- `.blueprint-badge` - Badge/status indicator

## Performance Optimizations

1. **Lazy Loading**: Components and routes are lazy-loaded
2. **Image Optimization**: Next.js Image component with automatic optimization
3. **Code Splitting**: Automatic code splitting by Next.js
4. **Caching**: API responses are cached where appropriate
5. **Debounced Inputs**: File upload and search inputs are debounced
6. **Virtual Scrolling**: Large data tables use virtual scrolling

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For support, email support@logisticbot.com or open an issue on GitHub.
# logisticbot
# logisticbot
