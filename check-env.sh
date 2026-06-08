#!/bin/bash

echo "Checking frontend environment variables..."

echo ""
echo "Local development:"
echo "VITE_API_BASE_URL=http://localhost:10000"
echo "VITE_BACKEND_URL=http://localhost:10000"
echo "VITE_ENABLE_DEBUG=true"

echo ""
echo "Production deployment:"
echo "VITE_API_BASE_URL=https://fitness-backend-jkfm.onrender.com"
echo "VITE_BACKEND_URL=https://fitness-backend-jkfm.onrender.com"
echo "VITE_ENABLE_DEBUG=false"
echo "VITE_ENABLE_ANALYTICS=false"

echo ""
echo "Local files:"
echo "- .env.development is used by npm run dev and build:dev"
echo "- .env.production is used by npm run build"

echo ""
echo "Current .env.production content:"
cat .env.production
