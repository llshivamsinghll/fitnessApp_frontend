#!/bin/bash

# Vercel Environment Variables Setup Script
# Run this after setting up your environment variables in Vercel dashboard

echo "🚀 Checking environment variables for production deployment..."

echo "Environment variables that should be set in Vercel dashboard:"
echo "VITE_API_BASE_URL=https://fitness-backend-jkfm.onrender.com"
echo "VITE_ENABLE_DEBUG=true"
echo "VITE_ENABLE_ANALYTICS=false"

echo ""
echo "To set these in Vercel:"
echo "1. Go to your Vercel project dashboard"
echo "2. Go to Settings > Environment Variables"
echo "3. Add each variable for Production environment"
echo "4. Redeploy your application"

echo ""
echo "Current .env.production content:"
cat .env.production