#!/bin/bash

echo "🚀 Setting up Nhost + Hasura + n8n Backend..."

# Create necessary directories
mkdir -p backend/hasura/metadata/databases/default/tables
mkdir -p backend/hasura/migrations
mkdir -p backend/n8n/workflows

# Start services
echo "📦 Starting Docker services..."
cd backend && docker-compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 30

# Apply Hasura metadata
echo "🔧 Applying Hasura metadata..."
docker-compose exec hasura hasura-cli metadata apply --endpoint http://localhost:8080 --admin-secret your-hasura-admin-secret

# Apply migrations
echo "📊 Applying database migrations..."
docker-compose exec hasura hasura-cli migrate apply --endpoint http://localhost:8080 --admin-secret your-hasura-admin-secret

# Import n8n workflow
echo "🔄 Importing n8n workflow..."
curl -X POST http://localhost:5678/rest/workflows/import \
  -H "Content-Type: application/json" \
  -u admin:admin123 \
  -d @n8n/workflows/chatbot-workflow.json

echo "✅ Backend setup complete!"
echo ""
echo "🌐 Services running at:"
echo "  - Hasura Console: http://localhost:8080"
echo "  - n8n Interface: http://localhost:5678"
echo "  - Auth Service: http://localhost:4000"
echo "  - PostgreSQL: localhost:5432"
echo ""
echo "🔑 Default credentials:"
echo "  - Hasura Admin Secret: your-hasura-admin-secret"
echo "  - n8n Login: admin / admin123"
echo "  - PostgreSQL: postgres / postgres"
echo ""
echo "⚠️  Remember to:"
echo "  1. Update environment variables in docker-compose.yml"
echo "  2. Configure your OpenRouter API key in n8n workflow"
echo "  3. Set up SMTP settings for email authentication"
echo "  4. Update frontend environment variables"