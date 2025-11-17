# Development Workflow Guide

## PR-Based Development Strategy

This guide outlines the workflow for developing features using a pull request-based approach.

## Branch Strategy

### Main Branches
- `main` - Production-ready code
- Feature branches - Created for each new feature/fix

### Branch Naming Convention
```
feature/feature-name          # New features
fix/bug-name                  # Bug fixes
refactor/component-name       # Code refactoring
perf/optimization-name        # Performance improvements
docs/documentation-update     # Documentation changes
```

## Workflow Steps

### 1. Create a Feature Branch
```bash
# Update main branch
git checkout main
git pull origin main

# Create and switch to feature branch
git checkout -b feature/dashboard-courses
```

### 2. Make Changes
- Write code following the project conventions
- Test thoroughly on low-end devices
- Ensure construction theme consistency
- Add comprehensive error handling

### 3. Commit Changes
```bash
# Stage changes
git add .

# Commit with descriptive message
git commit -m "Add courses page with construction theme

- Implemented course listing with grid layout
- Added search and filter functionality
- Optimized for low-end devices (CSS-only animations)
- Construction theme consistent with app branding

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

### 4. Push to GitHub
```bash
# Push feature branch to remote
git push -u origin feature/dashboard-courses
```

### 5. Create Pull Request
```bash
# Using GitHub CLI
gh pr create --title "Add dashboard courses page" --body "Description of changes"

# Or create manually on GitHub
# Visit: https://github.com/stephenfgarcia/Civilabs/pulls
```

### 6. Review Process
- Self-review the PR
- Check all tests pass
- Verify performance on low-end devices
- Ensure no warnings or errors
- Wait for approval (if team workflow requires it)

### 7. Merge PR
```bash
# Merge via GitHub CLI
gh pr merge <pr-number> --squash

# Or merge via GitHub UI
```

### 8. Clean Up
```bash
# Switch back to main
git checkout main

# Pull latest changes
git pull origin main

# Delete local feature branch
git branch -d feature/dashboard-courses

# Delete remote feature branch (if not auto-deleted)
git push origin --delete feature/dashboard-courses
```

## Development Stages for Civilabs LMS

### Stage 1: Core Authentication & Settings ✅
- [x] Login page
- [x] Register page
- [x] User settings page
- [x] Admin settings page
- [x] Error handling

### Stage 2: Dashboard Pages (In Progress)
- [ ] Dashboard home
- [ ] Courses page
- [ ] My Learning page
- [ ] Profile page
- [ ] Leaderboard page
- [ ] Certificates page
- [ ] Help page

### Stage 3: Admin Pages
- [ ] Admin dashboard
- [ ] User management
- [ ] Course management
- [ ] Department management
- [ ] Analytics/Reports
- [ ] System settings

### Stage 4: Course Functionality
- [ ] Course details page
- [ ] Course content viewer
- [ ] Lesson/module navigation
- [ ] Video player integration
- [ ] Quiz/assessment system
- [ ] Progress tracking

### Stage 5: API Routes
- [ ] Courses API
- [ ] Enrollments API
- [ ] Progress API
- [ ] Certificates API
- [ ] User management API
- [ ] Analytics API

### Stage 6: Advanced Features
- [ ] Real-time notifications
- [ ] File uploads (avatars, course materials)
- [ ] Search functionality
- [ ] Gamification (points, badges)
- [ ] Social features (comments, discussions)
- [ ] Mobile responsiveness refinement

## Code Quality Checklist

Before creating a PR, ensure:

- [ ] **Performance**: Tested on low-end devices
- [ ] **Theme**: Construction theme consistent
- [ ] **Animations**: CSS-only (no anime.js)
- [ ] **Validation**: Client-side and server-side
- [ ] **Error Handling**: Specific error messages
- [ ] **Responsive**: Mobile, tablet, desktop tested
- [ ] **Accessibility**: Proper ARIA labels, keyboard navigation
- [ ] **Type Safety**: No TypeScript errors
- [ ] **Clean Code**: No console.logs, commented code removed

## Git Commands Reference

```bash
# Check current branch
git branch

# View status
git status

# View commit history
git log --oneline

# Stash changes
git stash
git stash pop

# Amend last commit
git commit --amend

# Reset to previous commit (careful!)
git reset --hard HEAD~1

# View diff
git diff

# View remote URLs
git remote -v
```

## Quick Start for New Feature

```bash
# 1. Create feature branch
git checkout -b feature/my-new-feature

# 2. Make changes, then commit
git add .
git commit -m "Add my new feature"

# 3. Push and create PR
git push -u origin feature/my-new-feature
gh pr create

# 4. After approval, merge
gh pr merge --squash

# 5. Clean up
git checkout main
git pull origin main
git branch -d feature/my-new-feature
```

## Tips

- **Commit Often**: Make small, focused commits
- **Pull Regularly**: Keep your branch up to date with main
- **Test Thoroughly**: Don't skip testing on low-end devices
- **Document**: Add comments for complex logic
- **Review Your Own Code**: Before creating PR, review your changes
