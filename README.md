# NUDM Intern Assessment 2026 - Rahul Patel

UPYOG Property Tax Analytics Dashboard for a multi-tenant property tax platform. The app loads `src/properties.json` directly in React and analyzes 1,000 property records across Delhi, Mumbai, Pune, Bengaluru, Chennai, Hyderabad, Ahmedabad, Kolkata, Jaipur, and Lucknow.

## Features

- Tenant filter with `All Cities` plus all 10 city tenants.
- KPI cards for total registered, approved, rejected, and total collection.
- City comparison chart for total collection.
- Bonus stacked status chart for approved, pending, and rejected properties by city.
- Property mix chart and recent registration table for the selected tenant.
- AI-style chat assistant for property tax analytics questions.
- Optional Gemini API integration with a local analytics fallback when no API key is configured.

## Tech Stack

- React + Vite
- Recharts
- Lucide React icons
- Google Gemini API-ready chat layer

## Setup

```bash
npm install
npm run dev
```

Open the local URL shown by Vite, usually `http://localhost:5173`.

## AI API Key

The dashboard works without an API key by answering common analytics questions from the computed data summary. To enable Gemini responses:

1. Create a `.env` file in the project root.
2. Add your key:

```bash
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

3. Restart the dev server.

Do not commit `.env`. It is already ignored by `.gitignore`.

## Useful Scripts

```bash
npm run dev
npm run build
npm run lint
```

## Data

The committed `src/properties.json` contains exactly 1,000 records with the required assessment fields:

- `property_id`
- `tenant`
- `owner_name`
- `property_type`
- `ward`
- `area_sqft`
- `status`
- `annual_tax_inr`
- `collection_inr`
- `registration_date`
- `floor_count`
- `address`
