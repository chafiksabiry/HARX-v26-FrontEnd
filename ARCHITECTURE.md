# Harx AI - Application Architecture

## Technology Stack

### Frontend
- **Next.js 16** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Ant Design** - UI components

### Backend
- **Next.js API Routes** - Server-side logic
- **MongoDB + Mongoose** - Database and ODM
- **JWT** - Authentication
- **Supabase** - Additional database features

### External Services
- **OpenAI** - AI-powered features
- **Google Cloud Vertex AI** - Advanced AI capabilities
- **Twilio** - Telephony and voice
- **Cloudinary** - File storage and image processing
- **LinkedIn OAuth** - Social authentication

## Application Flow

### 1. Authentication Flow

```
User Registration/Login
    ↓
Email/Password or LinkedIn OAuth
    ↓
JWT Token Generation
    ↓
Store token in cookies/localStorage
    ↓
Redirect based on user type
```

### 2. User Types

The application supports two main user types:

#### Company Users
- Create company profiles
- Post gigs (job opportunities)
- Manage leads
- Match with reps
- Monitor operations
- Access analytics

#### Rep (Representative) Users
- Create professional profiles
- Upload CVs
- Complete skills assessments
- Browse gig marketplace
- Apply for gigs
- Track performance

### 3. Onboarding Flow

```
New User
    ↓
User Type Selection (/onboarding/choice)
    ↓
    ├─> Company → /onboarding/company
    │       ↓
    │   Company Profile Creation
    │       ↓
    │   /comporchestrator
    │
    └─> Rep → /onboarding/rep
            ↓
        Profile Creation + CV Upload
            ↓
        /reporchestrator
```

## Key Features

### 1. Gig Creation System

**Location:** `/components/Gigs/`

Features:
- Multi-step wizard for gig creation
- AI-powered suggestions
- Skills matching
- Schedule configuration
- Commission structure
- Team structure definition

**Technologies:**
- React Hook Form for form management
- OpenAI for AI suggestions
- MongoDB for storage

### 2. Matching System

**Location:** `/lib/matching/`

The matching engine connects reps with appropriate gigs based on:
- Skills compatibility
- Language proficiency
- Availability
- Location/timezone
- Experience level
- Industry knowledge

**Algorithm:**
```javascript
Match Score =
  (Skills Match × 0.4) +
  (Language Match × 0.2) +
  (Availability Match × 0.2) +
  (Experience Match × 0.1) +
  (Location Match × 0.1)
```

### 3. Knowledge Base

**Location:** `/components/knowledgebase/`

Features:
- Document upload and management
- AI-powered search
- Context-aware responses
- Script generation for sales calls
- Company knowledge management

### 4. Telephony Integration

**Location:** `/services/integrations/twilioService.ts`

Features:
- Make/receive calls via Twilio
- Call recording
- Real-time transcription
- Call analytics
- Integration with lead management

### 5. AI Features

#### OpenAI Integration
- Gig description generation
- Skills extraction from CVs
- Automated matching suggestions
- Call script generation

#### Google Vertex AI
- Advanced language understanding
- Custom model training
- Enhanced matching algorithms

## Database Schema

### Core Collections

#### Users
```typescript
{
  _id: ObjectId,
  email: string,
  fullName: string,
  password: string (hashed),
  role: 'company' | 'rep',
  isVerified: boolean,
  linkedInId?: string,
  createdAt: Date,
  updatedAt: Date
}
```

#### Companies
```typescript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  name: string,
  industry: string,
  overview: string,
  subscription: 'free' | 'standard' | 'premium',
  contact: {
    email: string,
    phone: string,
    website: string
  },
  createdAt: Date,
  updatedAt: Date
}
```

#### Agents (Reps)
```typescript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  fullName: string,
  email: string,
  skills: {
    professional: Skill[],
    technical: Skill[],
    soft: Skill[],
    languages: Language[]
  },
  experience: Experience[],
  availability: Schedule,
  createdAt: Date,
  updatedAt: Date
}
```

#### Gigs
```typescript
{
  _id: ObjectId,
  companyId: ObjectId (ref: Company),
  title: string,
  description: string,
  skills: {
    required: Skill[],
    preferred: Skill[]
  },
  availability: Schedule,
  remuneration: Commission,
  status: 'draft' | 'active' | 'closed',
  createdAt: Date,
  updatedAt: Date
}
```

#### Leads
```typescript
{
  _id: ObjectId,
  gigId: ObjectId (ref: Gig),
  name: string,
  email: string,
  phone: string,
  status: 'new' | 'contacted' | 'qualified' | 'converted',
  assignedTo: ObjectId (ref: Agent),
  createdAt: Date,
  updatedAt: Date
}
```

## Component Architecture

### Layout Structure

```
RootLayout (app/layout.tsx)
  ↓
AuthProvider (context/AuthContext.tsx)
  ↓
AuthGuard (components/AuthGuard.tsx)
  ↓
GlobalNav (components/GlobalNav.tsx)
  ↓
Page Content
```

### State Management

The application uses a combination of:
- **React Context** for authentication state
- **React Hook Form** for form state
- **Local State (useState)** for component-specific state
- **Cookies/LocalStorage** for persistent data

### API Structure

All API routes follow RESTful conventions:

```
/api/auth/*          - Authentication endpoints
/api/companies/*     - Company management
/api/agents/*        - Rep profile management
/api/gigs/*          - Gig CRUD operations
/api/leads/*         - Lead management
/api/skills/*        - Skills database
/api/matching/*      - Matching algorithms
/api/files/*         - File uploads
```

## Security

### Authentication
- JWT tokens with secure signing
- HTTP-only cookies (recommended)
- Token refresh mechanism
- Password hashing with bcrypt

### Authorization
- Role-based access control (RBAC)
- Route protection with middleware
- API endpoint validation

### Data Protection
- Environment variables for secrets
- No hardcoded credentials
- Secure MongoDB connections
- HTTPS enforcement in production

## Performance Optimizations

### Frontend
- Code splitting with Next.js App Router
- Image optimization
- Lazy loading of components
- Memoization of expensive computations

### Backend
- MongoDB connection pooling
- Query optimization with indexes
- Caching of frequently accessed data
- Pagination for large datasets

### Build
- TypeScript compilation
- Tree shaking
- Minification
- Static page generation where possible

## Monitoring & Debugging

### Logging
```typescript
console.log('[Component] Message') // Development
// Use proper logging service in production
```

### Error Handling
- Try-catch blocks for async operations
- Error boundaries for React components
- User-friendly error messages
- Detailed error logs for debugging

## Future Improvements

### Recommended Enhancements

1. **Database Migration to Supabase**
   - Move from MongoDB to Supabase Postgres
   - Implement Row Level Security
   - Use Supabase real-time features

2. **Testing**
   - Unit tests with Jest
   - Integration tests
   - E2E tests with Playwright

3. **Performance**
   - Implement Redis caching
   - Add CDN for static assets
   - Optimize database queries

4. **Features**
   - Real-time notifications
   - Advanced analytics dashboard
   - Mobile app (React Native)
   - Multi-language support

5. **DevOps**
   - CI/CD pipeline
   - Automated testing
   - Performance monitoring
   - Error tracking (Sentry)

## Development Guidelines

### Code Style
- Use TypeScript for type safety
- Follow Next.js best practices
- Use functional components with hooks
- Keep components small and focused
- Document complex logic

### File Organization
- Components in `/components`
- API routes in `/app/api`
- Utilities in `/lib` and `/utils`
- Types in `/types`
- Services in `/services`
- Models in `/models`

### Naming Conventions
- Components: PascalCase (UserProfile.tsx)
- Files: camelCase or kebab-case
- Functions: camelCase
- Constants: UPPER_SNAKE_CASE
- Types/Interfaces: PascalCase

---

This architecture provides a solid foundation for scaling the Harx AI platform while maintaining code quality and performance.
