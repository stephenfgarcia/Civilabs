# 🏗️ Civilabs LMS - Development Workflow

**Last Updated:** 2025-11-25
**Project Status:** Production Ready

---

## 📋 Table of Contents

1. [Git Workflow](#git-workflow)
2. [Development Standards](#development-standards)
3. [Code Quality Guidelines](#code-quality-guidelines)
4. [Testing Protocol](#testing-protocol)
5. [Deployment Process](#deployment-process)

---

## 🔄 Git Workflow

### Branch Strategy

```
main                    # Production-ready code (protected)
├── feature/*          # New features
├── fix/*              # Bug fixes
├── refactor/*         # Code refactoring
├── perf/*             # Performance improvements
└── docs/*             # Documentation updates
```

### Standard Development Flow

#### 1. Start New Feature
```bash
# Update main branch
git checkout main
git pull origin main

# Create feature branch
git checkout -b feature/feature-name
```

#### 2. Development
```bash
# Make changes
# Test thoroughly
# Ensure TypeScript compiles

# Check status
git status

# Stage changes
git add .

# Commit with descriptive message
git commit -m "feat: Add feature description

- Bullet point of changes
- Another change
- API integration details

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

#### 3. Push and PR
```bash
# Push to remote
git push -u origin feature/feature-name

# Create PR (GitHub CLI)
gh pr create --title "Feature: Title" --body "Description"

# Or create PR via GitHub UI
```

#### 4. Merge and Cleanup
```bash
# After PR approval, merge (squash)
gh pr merge --squash

# Switch to main
git checkout main
git pull origin main

# Delete feature branch
git branch -d feature/feature-name
```

---

## 🎯 Development Standards

### File Structure

```
civilabs-lms/
├── app/                      # Next.js App Router
│   ├── (auth)/              # Auth pages
│   ├── (dashboard)/         # Student portal
│   ├── (instructor)/        # Instructor portal
│   └── (admin)/             # Admin portal
├── components/              # Reusable components
│   ├── ui/                  # Base UI components
│   ├── charts/              # Chart components
│   └── forms/               # Form components
├── lib/                     # Core utilities
│   ├── services/            # API services
│   ├── utils/               # Helper functions
│   └── types/               # TypeScript types
├── hooks/                   # Custom React hooks
└── public/                  # Static assets
```

### Naming Conventions

#### Files
- **Components**: PascalCase (`UserCard.tsx`)
- **Services**: camelCase with `.service.ts` (`users.service.ts`)
- **Utilities**: camelCase (`formatDate.ts`)
- **Types**: PascalCase with `.types.ts` (`User.types.ts`)

#### Code
- **Components**: PascalCase (`function UserProfile() {}`)
- **Functions**: camelCase (`function formatDate() {}`)
- **Constants**: UPPER_SNAKE_CASE (`const API_URL = ''`)
- **Interfaces**: PascalCase with 'I' prefix optional (`interface User {}`)

### TypeScript Standards

```typescript
// ✅ Good - Explicit types
interface UserData {
  id: string
  name: string
  email: string
}

async function getUser(id: string): Promise<UserData> {
  const response = await usersService.getUserById(id)
  return response.data
}

// ❌ Bad - Any types
function getUser(id: any): any {
  return fetch('/api/users/' + id)
}
```

---

## 📐 Code Quality Guidelines

### Component Structure

```typescript
'use client'

// 1. Imports (external → internal → types)
import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { usersService } from '@/lib/services'
import type { User } from '@/lib/types'

// 2. Types/Interfaces
interface Props {
  userId: string
}

// 3. Component
export default function UserProfile({ userId }: Props) {
  // 3a. State
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // 3b. Effects
  useEffect(() => {
    loadUser()
  }, [userId])

  // 3c. Functions
  const loadUser = async () => {
    try {
      setLoading(true)
      const response = await usersService.getUserById(userId)
      setUser(response.data)
    } catch (error) {
      console.error('Error loading user:', error)
    } finally {
      setLoading(false)
    }
  }

  // 3d. Render
  if (loading) return <div>Loading...</div>
  if (!user) return <div>User not found</div>

  return (
    <Card>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </Card>
  )
}
```

### Error Handling Pattern

```typescript
// ✅ Good - Comprehensive error handling
try {
  setLoading(true)
  const result = await apiCall()

  toast({
    title: 'Success',
    description: 'Operation completed successfully'
  })
} catch (error) {
  toast({
    title: 'Error',
    description: error instanceof Error ? error.message : 'Operation failed',
    variant: 'destructive'
  })
} finally {
  setLoading(false)
}
```

### Service Layer Pattern

```typescript
// lib/services/example.service.ts
class ExampleService {
  async getItems(): Promise<ApiResponse<Item[]>> {
    return apiClient.get<Item[]>('/items')
  }

  async createItem(data: CreateItemData): Promise<ApiResponse<Item>> {
    return apiClient.post<Item>('/items', data)
  }
}

export const exampleService = new ExampleService()
export default exampleService
```

---

## 🧪 Testing Protocol

### Pre-Commit Checklist

- [ ] **TypeScript** - No compilation errors
```bash
npx tsc --noEmit
```

- [ ] **Build** - Production build succeeds
```bash
npm run build
```

- [ ] **Functionality** - Feature works as expected
- [ ] **Responsive** - Mobile/tablet/desktop tested
- [ ] **Error Handling** - All error cases handled
- [ ] **Loading States** - Loading indicators present
- [ ] **Toast Notifications** - User feedback implemented
- [ ] **No Console Logs** - Remove debug console.logs
- [ ] **No Commented Code** - Remove unused code

### Manual Testing

1. **Happy Path** - Test primary user flow
2. **Error Cases** - Test with invalid data
3. **Edge Cases** - Test boundary conditions
4. **Performance** - Test on low-end device/slow network
5. **Accessibility** - Keyboard navigation, screen readers

---

## 🎨 UI/UX Standards

### Construction Theme Requirements

- **Typography**: Use font-black for headings
- **Colors**: Gradient backgrounds (primary, success, warning, danger)
- **Effects**: Glass-morphism, concrete textures, blueprint grids
- **Animations**: CSS-only (no anime.js or heavy libraries)
- **Buttons**: Use MagneticButton component
- **Cards**: Glass-effect with border-4

### Responsive Design

```typescript
// ✅ Good - Responsive classes
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

// ✅ Good - Mobile-first approach
<h1 className="text-3xl md:text-4xl lg:text-5xl">

// ❌ Bad - Fixed sizes
<div className="w-1200">
```

---

## 🚀 Deployment Process

### Pre-Deployment Checklist

1. **Code Quality**
   - [ ] All TypeScript errors resolved
   - [ ] All console.logs removed
   - [ ] No hardcoded credentials
   - [ ] Environment variables configured

2. **Testing**
   - [ ] All features tested
   - [ ] Cross-browser compatibility verified
   - [ ] Mobile responsiveness confirmed
   - [ ] API endpoints functional

3. **Documentation**
   - [ ] README updated
   - [ ] API documentation current
   - [ ] Environment variables documented

4. **Build**
   ```bash
   # Clean build
   rm -rf .next
   npm run build

   # Test production build locally
   npm start
   ```

### Deployment Steps

```bash
# 1. Ensure main branch is up to date
git checkout main
git pull origin main

# 2. Build verification
npm run build

# 3. Deploy (Vercel)
vercel --prod

# 4. Post-deployment smoke test
# - Test critical user flows
# - Verify API connections
# - Check error handling
```

---

## 📝 Commit Message Format

### Structure
```
<type>: <subject>

<body>

<footer>
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `refactor`: Code refactoring
- `perf`: Performance improvement
- `docs`: Documentation
- `style`: Formatting, styling
- `test`: Adding tests
- `chore`: Maintenance

### Examples

```bash
# Feature
git commit -m "feat: Add CSV export to admin reports

- Implemented dynamic header generation
- Added proper CSV escaping
- Connected to real API data
- Added error handling

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"

# Bug Fix
git commit -m "fix: Resolve TypeScript error in reports page

Changed enrollmentsService to adminEnrollmentsService"

# Refactor
git commit -m "refactor: Extract user profile logic to custom hook

Improved code reusability and testability"
```

---

## 🛠️ Useful Commands

### Git
```bash
# View status
git status

# View diff
git diff

# View commit history
git log --oneline -10

# Stash changes
git stash
git stash pop

# Undo last commit (keep changes)
git reset --soft HEAD~1

# View remote branches
git branch -r
```

### Development
```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build production
npm run build

# Start production server
npm start

# Type check
npx tsc --noEmit

# Lint
npm run lint
```

### Database
```bash
# Run migrations
npx prisma migrate dev

# Generate Prisma client
npx prisma generate

# Open Prisma Studio
npx prisma studio

# Seed database
npm run db:seed
```

---

## 🎓 Best Practices

### DO ✅

- Write descriptive commit messages
- Test on low-end devices
- Use TypeScript strict mode
- Implement error handling everywhere
- Add loading states to async operations
- Use toast notifications for user feedback
- Follow the construction theme
- Write self-documenting code
- Keep components small and focused
- Use the service layer for API calls

### DON'T ❌

- Commit directly to main
- Skip TypeScript checks
- Leave console.logs in production code
- Hardcode API URLs or credentials
- Use 'any' type unnecessarily
- Commit large binary files
- Push broken code
- Skip error handling
- Forget loading states
- Use heavy animation libraries

---

## 📚 Resources

### Documentation
- **Next.js**: https://nextjs.org/docs
- **React**: https://react.dev
- **TypeScript**: https://www.typescriptlang.org/docs
- **Tailwind**: https://tailwindcss.com/docs
- **Prisma**: https://www.prisma.io/docs

### Internal Docs
- **PROJECT_STATUS.md** - Current project status
- **README.md** - Project overview
- **SETUP.md** - Setup instructions
- **DOCUMENTATION.md** - API documentation

---

**Remember:** Clean code is not written by following a set of rules. Clean code is written by someone who cares.

**Project Status:** ✅ Production Ready
**TypeScript:** ✅ No Errors
**Build:** ✅ Passing
