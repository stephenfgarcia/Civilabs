#!/bin/bash

# Vercel Deployment Helper Script
# This script helps you deploy to Vercel and run migrations

echo "======================================"
echo "Civilabs LMS - Vercel Deployment"
echo "======================================"
echo ""

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "Installing Vercel CLI..."
    npm install -g vercel
fi

# Login to Vercel
echo "Step 1: Login to Vercel"
vercel login

# Link project
echo ""
echo "Step 2: Link to Vercel project"
vercel link

# Pull environment variables
echo ""
echo "Step 3: Pull environment variables"
vercel env pull .env.local

echo ""
echo "Step 4: Generate Prisma Client"
npx prisma generate

echo ""
echo "Step 5: Run database migrations"
read -p "Do you want to run migrations now? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    npx prisma migrate deploy
    
    echo ""
    read -p "Do you want to seed the database? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        npx prisma db seed
        echo "✅ Database seeded successfully!"
    fi
fi

echo ""
echo "======================================"
echo "Deployment Complete!"
echo "======================================"
echo ""
echo "Your app should be available at:"
echo "https://your-project.vercel.app"
echo ""
echo "Next steps:"
echo "1. Test login with seeded users"
echo "2. Configure custom domain (optional)"
echo "3. Set up monitoring (optional)"
