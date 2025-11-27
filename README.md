# Package Security Checker

A Next.js application to check if your npm packages are in the affected/malicious packages list.

## Features

- 📦 Parse package.json and extract dependencies and devDependencies
- 🔍 Check against a database of affected packages
- 🎨 Beautiful UI built with ShadcnUI and TailwindCSS
- 📊 Visual results with statistics and detailed information
- ⚡ Fast and responsive

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

1. **Load Sample**: Click the "Load Sample" button to load a sample package.json
2. **Paste Your package.json**: Or paste your own package.json content into the textarea
3. **Check Packages**: Click "Check Packages" to analyze your dependencies
4. **Review Results**: See which packages are affected and need attention

## Features

### Input Section
- Paste your package.json content
- Load sample data for testing
- Clear button to reset

### Results Section
- **Summary Statistics**: Total packages, affected packages, and safe packages
- **Affected Packages List**: Detailed list of affected packages with:
  - Package name
  - Your installed version
  - Affected versions
  - Package type (dependency/devDependency)
- **Security Alerts**: Visual alerts for affected packages
- **All Clear Message**: When no packages are affected

## Technology Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: TailwindCSS v4
- **UI Components**: ShadcnUI
- **Icons**: Lucide React

## Database

The application uses a local JSON file (`affected_packages_20251126_104743.json`) containing the affected packages database. This file is loaded from the public folder at runtime.

## Project Structure

```
package-checker/
├── app/
│   ├── page.tsx                 # Main page
│   └── globals.css              # Global styles
├── components/
│   ├── PackageChecker.tsx       # Main component
│   └── ui/                      # ShadcnUI components
├── lib/
│   ├── package-checker.ts       # Package checking logic
│   ├── types.ts                 # TypeScript types
│   └── utils.ts                 # Utility functions
├── public/
│   └── affected_packages_*.json # Affected packages database
└── package.json
```

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme).

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
