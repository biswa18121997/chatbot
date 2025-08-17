# Nhost Chatbot Application

A modern, real-time chatbot application built with React, TypeScript, Nhost authentication, Hasura GraphQL, and n8n automation. Features email-based authentication, real-time messaging, and AI-powered responses through OpenRouter.

## 🚀 Features

- **Authentication**: Secure email-based sign-up/sign-in with Nhost Auth
- **Real-time Chat**: GraphQL subscriptions for instant message updates
- **AI Integration**: Chatbot responses powered by OpenRouter through n8n workflows
- **User Security**: Row-level security ensuring users only access their own data
- **Modern UI**: Beautiful, responsive design with smooth animations
- **Production Ready**: Comprehensive error handling and loading states

## 🛠 Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Vite
- **Authentication**: Nhost Auth
- **Database**: PostgreSQL with Hasura GraphQL API
- **Real-time**: GraphQL subscriptions
- **Automation**: n8n workflows
- **AI**: OpenRouter API (GPT-3.5 Turbo)
- **Deployment**: Netlify
- **Icons**: Lucide React

## 📋 Prerequisites

- Node.js 18+ 
- Nhost account
- n8n instance
- OpenRouter API key

## 🏗 Architecture

```
Frontend (React) 
    ↓ GraphQL
Hasura API 
    ↓ Actions
n8n Workflows 
    ↓ HTTP
OpenRouter API
```

## 🚀 Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd nhost-chatbot
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Nhost**
   - Update `src/lib/nhost.ts` with your Nhost credentials
   - Update `src/lib/apollo.ts` with your Hasura endpoint

4. **Set up database schema**
   - See `src/docs/SETUP.md` for detailed instructions

5. **Run development server**
   ```bash
   npm run dev
   ```

## 📚 Documentation

For detailed setup instructions, see [SETUP.md](src/docs/SETUP.md).

## 🔒 Security

- Row-level security on all tables
- JWT-based authentication
- Secure API key management
- CORS configuration
- Input validation

## 🚀 Deployment

The application is deployed on Netlify. To deploy your own instance:

1. Build the application: `npm run build`
2. Deploy the `dist` folder to Netlify
3. Configure environment variables
4. Set up your backend services (Nhost, n8n)

## 📝 Key Features Implemented

- ✅ Email authentication with Nhost
- ✅ Real-time chat interface
- ✅ GraphQL-only communication
- ✅ Row-level security
- ✅ Hasura Actions for chatbot integration
- ✅ n8n workflow automation
- ✅ Responsive design
- ✅ Production-ready error handling

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🐛 Known Issues

- Requires backend setup (Nhost, Hasura, n8n) for full functionality
- Demo mode available with mock data for development

## 🔗 Live Demo

Visit the live application: [Deployed Application Link]

---

Built with ❤️ using modern web technologies for a seamless chat experience.