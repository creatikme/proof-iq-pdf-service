# ProofIQ PDF Generation Service

This is a Vercel serverless function that handles PDF generation for ProofIQ ROI reports.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Deploy to Vercel:
```bash
vercel
```

3. Set up environment variables in Vercel dashboard (if needed)

## API Endpoint

### POST /api/generate-pdf

Generates a PDF report from calculator data.

**Request Body:**
```json
{
  "annual_lifeline_enrollments": 10000,
  "average_review_time_seconds": 300,
  "annual_order_volume": 5000,
  "average_non_compliance_cost": 50000
}
```

**Response:**
```json
{
  "success": true,
  "pdf": "base64-encoded-pdf-string"
}
```

## Local Development

```bash
npm run dev
```

The function will be available at `http://localhost:3000/api/generate-pdf`
