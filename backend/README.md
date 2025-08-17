# Nhost + Hasura + n8n Backend

This backend provides a complete implementation of the chatbot application using:

- **Nhost Auth**: Email-based authentication
- **Hasura GraphQL**: Database operations with Row-Level Security
- **n8n**: Workflow automation for chatbot responses
- **OpenRouter**: AI model integration

## Quick Start

1. **Prerequisites**
   ```bash
   # Install Docker and Docker Compose
   docker --version
   docker-compose --version
   ```

2. **Setup Backend**
   ```bash
   # Make setup script executable
   chmod +x backend/setup.sh
   
   # Run setup
   ./backend/setup.sh
   ```

3. **Configure Environment**
   ```bash
   # Copy environment template
   cp .env.example .env.local
   
   # Update with your values
   nano .env.local
   ```

## Services

### Hasura GraphQL (Port 8080)
- **Console**: http://localhost:8080
- **Admin Secret**: `your-hasura-admin-secret`
- **Features**: 
  - Row-Level Security enabled
  - User permissions configured
  - Actions for chatbot integration

### n8n Workflow (Port 5678)
- **Interface**: http://localhost:5678
- **Login**: admin / admin123
- **Features**:
  - Webhook endpoint for Hasura Actions
  - OpenRouter API integration
  - Chat ownership validation
  - Automatic response saving

### Nhost Auth (Port 4000)
- **Endpoint**: http://localhost:4000
- **Features**:
  - Email/password authentication
  - JWT token generation
  - User management

### PostgreSQL (Port 5432)
- **Host**: localhost:5432
- **Database**: nhost
- **User**: postgres
- **Password**: postgres

## Configuration

### 1. Update Docker Environment
Edit `backend/docker-compose.yml`:

```yaml
# Update these values
HASURA_GRAPHQL_ADMIN_SECRET: your-secure-admin-secret
HASURA_GRAPHQL_JWT_SECRET: your-jwt-secret-key-must-be-at-least-32-characters
AUTH_SMTP_HOST: your-smtp-host
AUTH_SMTP_USER: your-email@domain.com
AUTH_SMTP_PASS: your-app-password
```

### 2. Configure n8n Workflow
1. Open http://localhost:5678
2. Login with admin/admin123
3. Open the "Chatbot Workflow"
4. Update the OpenRouter API key in the "Call OpenRouter API" node
5. Update Hasura endpoint and admin secret if needed

### 3. Set Frontend Environment
Update `.env.local`:

```env
VITE_NHOST_SUBDOMAIN=localhost
VITE_NHOST_REGION=local
VITE_HASURA_GRAPHQL_URL=http://localhost:8080/v1/graphql
```

## Database Schema

### Tables Created:
- `chats`: User chat sessions
- `messages`: Chat messages (user and bot)

### Permissions:
- Users can only access their own chats and messages
- Row-Level Security enforced on all operations
- Actions protected by user role

## API Endpoints

### GraphQL Queries
```graphql
# Get user chats
query GetChats($user_id: uuid!) {
  chats(where: {user_id: {_eq: $user_id}}) {
    id
    title
    created_at
    updated_at
  }
}

# Get chat messages
query GetMessages($chat_id: uuid!) {
  messages(where: {chat_id: {_eq: $chat_id}}) {
    id
    content
    is_bot
    created_at
  }
}
```

### GraphQL Mutations
```graphql
# Create new chat
mutation CreateChat($title: String!, $user_id: uuid!) {
  insert_chats_one(object: {title: $title, user_id: $user_id}) {
    id
    title
  }
}

# Send message (triggers chatbot)
mutation SendMessage($chatId: uuid!, $content: String!) {
  sendMessage(chatId: $chatId, content: $content) {
    success
    message
    response
  }
}
```

### GraphQL Subscriptions
```graphql
# Real-time message updates
subscription MessagesSubscription($chat_id: uuid!) {
  messages(where: {chat_id: {_eq: $chat_id}}) {
    id
    content
    is_bot
    created_at
  }
}
```

## Deployment

### Production Setup
1. **Deploy to Cloud Provider**
   - Use Nhost Cloud for managed services
   - Or deploy Docker containers to your preferred platform

2. **Update Environment Variables**
   ```env
   VITE_NHOST_SUBDOMAIN=your-production-subdomain
   VITE_NHOST_REGION=your-production-region
   VITE_HASURA_GRAPHQL_URL=https://your-hasura-endpoint.hasura.app/v1/graphql
   ```

3. **Configure n8n Webhook**
   - Update webhook URL in Hasura Actions
   - Ensure n8n is accessible from Hasura

## Troubleshooting

### Common Issues

1. **Services not starting**
   ```bash
   # Check logs
   docker-compose logs hasura
   docker-compose logs n8n
   docker-compose logs auth
   ```

2. **Permission errors**
   ```bash
   # Reset permissions
   docker-compose exec hasura hasura-cli metadata reload
   ```

3. **n8n workflow not triggering**
   - Check webhook URL in Hasura Actions
   - Verify n8n workflow is active
   - Check n8n execution logs

4. **Authentication issues**
   - Verify JWT secret matches between services
   - Check SMTP configuration for email verification

### Logs and Monitoring
```bash
# View all logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f hasura
docker-compose logs -f n8n
docker-compose logs -f auth
```

## Security Considerations

1. **Change Default Secrets**
   - Update admin secrets
   - Use strong JWT keys
   - Configure proper SMTP credentials

2. **Network Security**
   - Use HTTPS in production
   - Configure proper CORS settings
   - Implement rate limiting

3. **Database Security**
   - Row-Level Security enabled
   - Proper user permissions
   - Regular backups

## Support

For issues and questions:
1. Check the logs first
2. Verify configuration matches documentation
3. Test individual services separately
4. Check network connectivity between services

This backend provides a complete, production-ready foundation for your chatbot application with proper security, scalability, and maintainability.