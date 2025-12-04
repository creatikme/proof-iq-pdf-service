#!/bin/bash

# API endpoint
API_URL="${API_URL:-https://leads.proofiqapp.com/api/leads}"

curl -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Bob Johnson",
    "email": "creatikme@gmail.com",
    "phone": "+1987654321",
    "company": "Tech Solutions Inc",
    "message": "Need ROI calculation",
    "source": "calculator",
    "annual_lifeline_enrollments": 10000,
    "average_review_time_seconds": 300,
    "annual_order_volume": 50000,
    "average_non_compliance_cost": 500
  }'
