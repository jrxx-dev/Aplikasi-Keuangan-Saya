#!/bin/bash

# Add environment variables to Vercel production
# Run this script: bash add-env-vars.sh

echo "Adding environment variables to Vercel..."
echo ""

# Read from .env and add to Vercel production
# NOTE: do NOT add NODE_TLS_REJECT_UNAUTHORIZED - it disables TLS cert
# verification process-wide. If it is already set in Vercel, remove it:
#   vercel env rm NODE_TLS_REJECT_UNAUTHORIZED production
vercel env add DATABASE_URL --production
vercel env add POSTGRES_DB --production
vercel env add POSTGRES_USER --production
vercel env add POSTGRES_PASSWORD --production
vercel env add NEXT_PUBLIC_SUPABASE_URL --production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY --production
vercel env add DATABASE_URL_DRIZLE_ORM --production
vercel env add SUPABASE_SERVICE_ROLE_KEY --production
vercel env add OPENROUTER_API_KEY --production
vercel env add TELEGRAM_BOT_TOKEN --production
vercel env add TELEGRAM_WEBHOOK_SECRET --production

echo ""
echo "Environment variables added. Deploying..."
vercel deploy --prod

echo ""
echo "Done! App should be live at:"
echo "https://finance-imyduvovx-jefri-afriansyah-maulanas-projects.vercel.app"
