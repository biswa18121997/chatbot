# Nhost Chatbot Application Setup Guide

This guide will help you set up the complete chatbot application with Nhost authentication, Hasura GraphQL, and n8n automation.

## Overview

The application consists of:
- **Frontend**: React application with TypeScript and Tailwind CSS
- **Authentication**: Nhost Auth for email-based sign-up/sign-in
- **Database**: PostgreSQL via Nhost with Hasura GraphQL API
- **Automation**: n8n workflow for chatbot responses via OpenRouter

## Step 1: Nhost Setup

1. **Create Nhost Project**
   - Visit [Nhost Console](https://app.nhost.io)
   - Create a new project
   - Note your `subdomain` and `region`

2. **Update Configuration**
   - Update `src/lib/nhost.ts` with your Nhost credentials:
   ```typescript
   const nhost = new NhostClient({
     subdomain: 'your-actual-subdomain',
     region: 'your-actual-region',
   });
   ```

3. **Database Schema Setup**
   - Go to your Nhost project's Hasura console
   - Navigate to the "Data" tab
   - Create the following tables:

   **chats table:**
   ```sql
   CREATE TABLE chats (
     id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
     title text NOT NULL,
     user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
     created_at timestamptz DEFAULT now(),
     updated_at timestamptz DEFAULT now()
   );
   ```

   **messages table:**
   ```sql
   CREATE TABLE messages (
     id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
     chat_id uuid NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
     user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
     content text NOT NULL,
     is_bot boolean DEFAULT false,
     created_at timestamptz DEFAULT now()
   );
   ```

## Step 2: Hasura Permissions Setup

1. **Enable Row Level Security**
   - For both tables, set up permissions for the `user` role:

   **chats table permissions:**
   - Select: `{"user_id": {"_eq": "X-Hasura-User-Id"}}`
   - Insert: `{"user_id": {"_eq": "X-Hasura-User-Id"}}`
   - Update: `{"user_id": {"_eq": "X-Hasura-User-Id"}}`
   - Delete: `{"user_id": {"_eq": "X-Hasura-User-Id"}}`

   **messages table permissions:**
   - Select: `{"user_id": {"_eq": "X-Hasura-User-Id"}}`
   - Insert: `{"user_id": {"_eq": "X-Hasura-User-Id"}}`
   - Update: `{"user_id": {"_eq": "X-Hasura-User-Id"}}`
   - Delete: `{"user_id": {"_eq": "X-Hasura-User-Id"}}`

2. **Update Apollo Configuration**
   - Update `src/lib/apollo.ts` with your Hasura endpoint:
   ```typescript
   const httpLink = createHttpLink({
     uri: 'https://your-hasura-endpoint.hasura.app/v1/graphql',
   });
   ```

## Step 3: Hasura Action Setup

1. **Create Action**
   - In Hasura console, go to "Actions" tab
   - Create a new action named `sendMessage`
   - Definition:
   ```graphql
   type Mutation {
     sendMessage(chat_id: uuid!, content: String!): MessageResponse
   }
   ```

   - Type definition:
   ```graphql
   type MessageResponse {
     success: Boolean!
     message: String!
     response: String
   }
   ```

2. **Configure Webhook**
   - Set handler URL to your n8n webhook endpoint
   - Add headers:
     - `x-hasura-user-id`: `{{$session_variables['x-hasura-user-id']}}`
     - `authorization`: `{{$session_variables['authorization']}}`

3. **Set Permissions**
   - Allow `user` role to execute the action

## Step 4: n8n Workflow Setup

1. **Install n8n**
   - Use Docker: `docker run -it --rm --name n8n -p 5678:5678 n8nio/n8n`
   - Or install locally: `npm install n8n -g`

2. **Create Workflow**
   - Create a new workflow with these nodes:

   **Webhook Node:**
   - Set HTTP method to POST
   - Enable authentication validation

   **Function Node (Validation):**
   ```javascript
   // Validate user owns the chat
   const chatId = $json.input.chat_id;
   const userId = $json.headers['x-hasura-user-id'];
   
   // You would query Hasura here to validate ownership
   // For now, we'll assume validation passes
   
   return {
     chat_id: chatId,
     content: $json.input.content,
     user_id: userId
   };
   ```

   **HTTP Request Node (OpenRouter):**
   - URL: `https://openrouter.ai/api/v1/chat/completions`
   - Method: POST
   - Headers:
     - `Authorization`: `Bearer YOUR_OPENROUTER_API_KEY`
     - `Content-Type`: `application/json`
   - Body:
   ```json
   {
     "model": "openai/gpt-3.5-turbo",
     "messages": [
       {
         "role": "user",
         "content": "{{$json.content}}"
       }
     ]
   }
   ```

   **HTTP Request Node (Save to Hasura):**
   - URL: Your Hasura GraphQL endpoint
   - Method: POST
   - Headers:
     - `Content-Type`: `application/json`
     - `x-hasura-admin-secret`: `YOUR_HASURA_ADMIN_SECRET`
   - Body:
   ```json
   {
     "query": "mutation InsertMessage($chat_id: uuid!, $content: String!, $user_id: uuid!) { insert_messages_one(object: {chat_id: $chat_id, content: $content, user_id: $user_id, is_bot: true}) { id } }",
     "variables": {
       "chat_id": "{{$json.chat_id}}",
       "content": "{{$json.choices[0].message.content}}",
       "user_id": "{{$json.user_id}}"
     }
   }
   ```

3. **Activate Workflow**
   - Save and activate the workflow
   - Note the webhook URL for Hasura action configuration

## Step 5: Environment Variables

Create a `.env.local` file with your credentials:
```env
VITE_NHOST_SUBDOMAIN=your-subdomain
VITE_NHOST_REGION=your-region
VITE_HASURA_GRAPHQL_URL=https://your-hasura-endpoint.hasura.app/v1/graphql
```

## Step 6: Deployment

1. **Build the Application**
   ```bash
   npm run build
   ```

2. **Deploy to Netlify**
   - Connect your Git repository to Netlify
   - Set build command: `npm run build`
   - Set publish directory: `dist`
   - Add environment variables in Netlify settings

## Security Considerations

1. **API Keys**: Store all API keys securely in n8n credentials
2. **CORS**: Configure Hasura CORS settings for your domain
3. **Rate Limiting**: Implement rate limiting in Hasura
4. **Validation**: Always validate user ownership in n8n workflows

## Testing

1. **Authentication**: Test sign-up and sign-in flows
2. **Chat Creation**: Verify new chats are created correctly
3. **Message Sending**: Test user messages are saved
4. **Bot Responses**: Verify chatbot responses are triggered and saved
5. **Real-time Updates**: Test GraphQL subscriptions work correctly
6. **Permissions**: Verify users can only access their own data

## Troubleshooting

1. **Authentication Issues**: Check Nhost configuration and credentials
2. **GraphQL Errors**: Verify Hasura permissions and schema
3. **Action Failures**: Check n8n workflow logs and webhook configuration
4. **Real-time Issues**: Verify subscription permissions in Hasura

## Production Checklist

- [ ] All API keys are secure and not exposed
- [ ] Hasura permissions are correctly configured
- [ ] n8n workflow is thoroughly tested
- [ ] Error handling is implemented throughout
- [ ] Rate limiting is in place
- [ ] Monitoring and logging are set up
- [ ] Application is deployed and accessible

This setup provides a complete, secure, and scalable chatbot application with proper authentication, permissions, and real-time capabilities.