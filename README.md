# Clockify Time Report CSV to PDF Converter

A React web application that converts Clockify Detailed Time Report CSV files into PDF format matching a structured time report layout.

## Tech Stack

- **Vite** - Build tool
- **React 18** - UI
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Papa Parse** - CSV parsing
- **jsPDF** + **jspdf-autotable** - PDF generation

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Usage

1. Open the app in your browser (e.g. http://localhost:5173)
2. Sign in with an allowed email and password
3. Optionally add employee names and select each user's payroll category
4. Click or drag-and-drop to upload a Clockify Detailed Time Report CSV file
5. Preview the converted data in the table
6. Click "Download ZIP" to generate one PDF per employee

## Supported CSV Format

The app expects Clockify export columns: `User`, `Project`, `Tags`, `Description`, `Start Date`, `Duration (decimal)`.

## Vercel Login Setup

Set these environment variables in Vercel:

- `LOGIN_PASSWORD`: shared password required for login
- `LOGIN_EMAIL_DOMAIN`: allowed domain, for example `@epsfresno.com`
- `AUTH_SECRET`: optional extra secret used to sign the session cookie
- `LOGIN_EMAIL`: optional exact email to allow instead of domain-wide login

If `LOGIN_EMAIL` is not set, any email ending with `LOGIN_EMAIL_DOMAIN` can sign in with the shared password.
