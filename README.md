# GO AI Hub - AI Solutions Marketplace

A comprehensive platform connecting AI solution providers with government and enterprise clients in Saudi Arabia.

## 🚀 Features

- **AI-Powered Onboarding**: Intelligent chatbot guides vendors through solution submission
- **Bilingual Support**: Full Arabic and English language support
- **Smart Categorization**: AI-generated tags and intelligent solution matching
- **Government Compliance**: Solutions verified against Saudi government requirements
- **Market Insights**: Real-time analytics and market trends
- **Secure Authentication**: Custom authentication with bcrypt password hashing

## 🛠 Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL)
- **Authentication**: Custom auth with bcrypt
- **AI Integration**: OpenAI GPT-4 for content generation and analysis
- **Deployment**: Netlify
- **Icons**: Lucide React

## 📦 Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   Fill in your Supabase and OpenAI API keys.

4. Set up Supabase:
   ```bash
   # Run migrations
   supabase db reset
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

## 🗄️ Database Setup

The application uses Supabase with the following main tables:

- `users` - User accounts and authentication
- `solutions` - AI solution submissions
- `interests` - User interests in solutions
- `profiles` - Evaluator profiles
- `audit_log` - System audit logging

### Running Migrations

Migrations are located in `supabase/migrations/`. To apply them:

```bash
supabase db reset
```

### Seed Data

Sample data for development is available in `supabase/seed.sql`.

## 🔐 Authentication

The application uses custom authentication with:
- Email/password sign up and sign in
- bcrypt password hashing (12 salt rounds)
- Session management via Supabase RPC functions
- Row Level Security (RLS) policies

## 🌐 Deployment

The application is configured for deployment on Netlify with proper SPA routing support.

### Build Commands

```bash
# Development
npm run dev

# Production build
npm run build

# Preview build locally
npm run preview

# Deploy to Netlify (requires Netlify CLI)
npm run deploy:netlify
```

### Environment Variables

Set these in your deployment platform:

```
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
OPENAI_API_KEY=your-openai-api-key
```

### SPA Configuration

The app includes proper SPA routing configuration:

- `public/_redirects` - Netlify redirect rules
- `public/_headers` - Security headers
- `netlify.toml` - Complete Netlify configuration
- Vite config optimized for SPA deployment

## 📊 Market Insights

Market data is updated weekly from verified sources including:
- Saudi AI Authority (SDAIA)
- McKinsey Global Institute
- Deloitte Middle East
- IDC Worldwide AI Spending Guide

## 🔧 Development

### Project Structure

```
src/
├── components/          # Reusable UI components
├── pages/              # Page components
├── context/            # React context providers
├── hooks/              # Custom React hooks
├── lib/                # Utility libraries
├── data/               # Static data and configurations
├── locales/            # Internationalization
├── types/              # TypeScript type definitions
└── utils/              # Utility functions
```

### Key Features

- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Performance Optimized**: Code splitting, lazy loading, and caching
- **Accessibility**: WCAG compliant with proper ARIA labels
- **SEO Optimized**: Meta tags and structured data
- **Error Handling**: Comprehensive error boundaries and validation
- **SPA Routing**: Proper client-side routing with fallbacks

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is proprietary software owned by GO Telecom.

## 📞 Support

For support, email info@goaihub.ai or visit our website.

---

**Note**: This is a Single Page Application (SPA) with proper routing configuration for production deployment.