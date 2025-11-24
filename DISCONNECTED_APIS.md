# Disconnected APIs - Backend Endpoints Without Frontend Services

**Date:** 2025-11-24
**Status:** These endpoints exist but are not used by any frontend service

---

## Summary

**Total Disconnected Endpoints:** 28
**Categories:** 9 systems

These are backend APIs that exist but have no frontend service wrappers. They can be implemented when needed.

---

## 1. Auth APIs (2 endpoints)

**Backend:** `app/api/auth/`

| Endpoint | Method | Status | Priority |
|----------|--------|--------|----------|
| `/auth/forgot-password` | POST | No frontend service | Medium |
| `/auth/reset-password` | POST | No frontend service | Medium |

**Use Case:** Password recovery flow

---

## 2. Departments APIs (5 endpoints)

**Backend:** `app/api/departments/`

| Endpoint | Method | Status | Priority |
|----------|--------|--------|----------|
| `/departments` | GET | No frontend service | Low |
| `/departments/:id` | GET | No frontend service | Low |
| `/departments` | POST | No frontend service | Low |
| `/departments/:id` | PUT | No frontend service | Low |
| `/departments/:id` | DELETE | No frontend service | Low |

**Use Case:** Department/organization management

---

## 3. Bookmarks APIs (3 endpoints)

**Backend:** `app/api/bookmarks/`

| Endpoint | Method | Status | Priority |
|----------|--------|--------|----------|
| `/bookmarks` | GET | No frontend service | Low |
| `/bookmarks` | POST | No frontend service | Low |
| `/bookmarks/:id` | DELETE | No frontend service | Low |

**Use Case:** Bookmark courses/content for later

---

## 4. Messages APIs (3 endpoints)

**Backend:** `app/api/messages/`

| Endpoint | Method | Status | Priority |
|----------|--------|--------|----------|
| `/messages` | GET | No frontend service | Medium |
| `/messages/:id` | GET | No frontend service | Medium |
| `/messages` | POST | No frontend service | Medium |

**Use Case:** Direct messaging between users

---

## 5. Conversations APIs (2 endpoints)

**Backend:** `app/api/conversations/`

| Endpoint | Method | Status | Priority |
|----------|--------|--------|----------|
| `/conversations` | GET | No frontend service | Medium |
| `/conversations` | POST | No frontend service | Medium |

**Use Case:** Conversation threads for messaging

---

## 6. Search APIs (1 endpoint)

**Backend:** `app/api/search/`

| Endpoint | Method | Status | Priority |
|----------|--------|--------|----------|
| `/search` | GET | No frontend service | High |

**Use Case:** Global search across courses, users, content

---

## 7. Reviews APIs (2 endpoints)

**Backend:** `app/api/reviews/`

| Endpoint | Method | Status | Priority |
|----------|--------|--------|----------|
| `/reviews` | GET | No frontend service | Medium |
| `/reviews` | POST | No frontend service | Medium |

**Use Case:** Course reviews and ratings

---

## 8. Media APIs (1 endpoint)

**Backend:** `app/api/media/`

| Endpoint | Method | Status | Priority |
|----------|--------|--------|----------|
| `/media` | POST | No frontend service | Low |

**Use Case:** Media file uploads

---

## 9. Questions APIs (5 endpoints)

**Backend:** `app/api/questions/`

| Endpoint | Method | Status | Priority |
|----------|--------|--------|----------|
| `/questions` | GET | No frontend service | Low |
| `/questions/:id` | GET | No frontend service | Low |
| `/questions` | POST | No frontend service | Low |
| `/questions/:id` | PUT | No frontend service | Low |
| `/questions/:id` | DELETE | No frontend service | Low |

**Use Case:** Quiz question management (separate from quiz system)

---

## Priority Recommendations

### High Priority (Implement Soon)
1. **Search** - Essential for user experience
   - Create `lib/services/search.service.ts`
   - Implement global search UI

### Medium Priority (Implement When Needed)
2. **Auth Password Recovery** - Security feature
   - Forgot password flow
   - Reset password flow

3. **Messages/Conversations** - Social feature
   - Direct messaging system
   - Conversation management

4. **Reviews** - Course quality feedback
   - Course rating system
   - Review submission and display

### Low Priority (Future Enhancement)
5. **Bookmarks** - Nice-to-have
6. **Departments** - Organization management
7. **Media** - Alternative to current upload system
8. **Questions** - Alternative question management

---

## Implementation Guide

When implementing frontend services for these APIs:

1. **Create Service File**
   ```typescript
   // lib/services/[feature].service.ts
   import { apiClient } from './api-client'

   class FeatureService {
     async getItems() {
       return apiClient.get('/endpoint')
     }
   }

   export const featureService = new FeatureService()
   ```

2. **Add Type Definitions**
   - Define TypeScript interfaces
   - Match backend response structures

3. **Create Frontend Components**
   - UI for the feature
   - Integration with service

4. **Test Integration**
   - Test all CRUD operations
   - Verify error handling

---

## Current System Status

### ✅ Fully Connected Systems (100% API Coverage)
- Admin Dashboard (8/8)
- Student Dashboard (2/2)
- Instructor Portal (4/4)
- Course Management (12/12)
- Quiz System (3/3)
- Discussions (16/16)
- Certificates (3/3)
- Notifications (9/9) - Recently completed
- Users (9/9)
- Progress (2/2)

### ⚠️ Disconnected Systems (No Frontend Service)
- Auth (Password Recovery)
- Departments
- Bookmarks
- Messages
- Conversations
- Search
- Reviews
- Media
- Questions

---

## Notes

- These endpoints are functional but unused
- No immediate impact on core functionality
- Can be implemented based on feature requirements
- All endpoints are documented in backend code

---

**Last Updated:** 2025-11-24
**Overall API Coverage:** 65/93 endpoints connected (70%)
**Critical Systems:** 100% connected ✅
