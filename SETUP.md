# Vercel Setup Guide

## 1. Set up Vercel Postgres Database

1. Go to https://vercel.com/creatikmes-projects/proof-iq-pdf-service
2. Click on the **Storage** tab
3. Click **Create Database**
4. Select **Postgres**
5. Name it: `proof-iq-db`
6. Click **Create**
7. Once created, click **Connect** and it will automatically add the database environment variables

## 2. Run Database Migration

After connecting the database, run the schema:

```bash
cd /Users/princedhiman/Documents/projects/proof-iq-pdf-service
vercel env pull .env.local
# This downloads your environment variables locally

# Then run the schema (you can use Vercel's SQL interface or psql)
```

Or use Vercel's SQL tab:
1. Go to Storage > proof-iq-db
2. Click on the **Data** tab
3. Click **Query**
4. Copy and paste the contents of `schema.sql`
5. Click **Run Query**

## 3. Add Environment Variables

Go to: https://vercel.com/creatikmes-projects/proof-iq-pdf-service/settings/environment-variables

Add these variables:

| Variable Name | Value | Environment |
|--------------|-------|-------------|
| `AWS_ACCESS_KEY_ID` | Your AWS access key | Production, Preview, Development |
| `AWS_SECRET_ACCESS_KEY` | Your AWS secret key | Production, Preview, Development |
| `AWS_REGION` | Your AWS region (e.g., `us-east-1`) | Production, Preview, Development |
| `AWS_S3_BUCKET` | Your S3 bucket name | Production, Preview, Development |
| `RESEND_API_KEY` | Your Resend API key | Production, Preview, Development |

## 4. Redeploy

After adding environment variables:
```bash
cd /Users/princedhiman/Documents/projects/proof-iq-pdf-service
vercel --prod
```

## 5. Test Your API

Test the leads endpoint:
```bash
curl -X POST https://proof-iq-pdf-service.vercel.app/api/leads \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "phone": "1234567890",
    "company": "Test Corp",
    "annual_lifeline_enrollments": 10000,
    "average_review_time_seconds": 300,
    "annual_order_volume": 5000,
    "average_non_compliance_cost": 50000
  }'
```

## 6. Update DNS (Optional)

If you want to use your custom domain `leads.proofiqapp.com`:

1. Go to https://vercel.com/creatikmes-projects/proof-iq-pdf-service/settings/domains
2. Click **Add Domain**
3. Enter: `leads.proofiqapp.com`
4. Vercel will provide DNS records to add to your domain provider
5. Add the provided CNAME or A record to your DNS settings

Your API will then be available at:
- `https://leads.proofiqapp.com/api/leads`
- `https://leads.proofiqapp.com/api/generate-pdf`
