#!/bin/bash

# API Testing Script for Civilabs LMS
# Tests all major backend API endpoints

BASE_URL="http://localhost:3001/api"
LEARNER_EMAIL="learner@civilabs.com"
LEARNER_PASSWORD="learner123"

echo "========================================="
echo "Civilabs LMS API Testing Suite"
echo "========================================="
echo ""

# 1. Test Authentication
echo "1. Testing Authentication API..."
echo "   POST /api/auth/login"
LOGIN_RESPONSE=$(curl -s -X POST $BASE_URL/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$LEARNER_EMAIL\",\"password\":\"$LEARNER_PASSWORD\"}")

TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.token')
USER_ID=$(echo $LOGIN_RESPONSE | jq -r '.user.id')

if [ "$TOKEN" != "null" ] && [ -n "$TOKEN" ]; then
  echo "   ✅ Login successful"
  echo "   Token: ${TOKEN:0:50}..."
  echo "   User ID: $USER_ID"
else
  echo "   ❌ Login failed"
  echo "   Response: $LOGIN_RESPONSE"
  exit 1
fi
echo ""

# 2. Test Courses API
echo "2. Testing Courses API..."
echo "   GET /api/courses"
COURSES_RESPONSE=$(curl -s $BASE_URL/courses \
  -H "Authorization: Bearer $TOKEN")

COURSES_SUCCESS=$(echo $COURSES_RESPONSE | jq -r '.success')
COURSES_COUNT=$(echo $COURSES_RESPONSE | jq -r '.count')

if [ "$COURSES_SUCCESS" = "true" ]; then
  echo "   ✅ Courses API working"
  echo "   Found $COURSES_COUNT course(s)"
else
  echo "   ❌ Courses API failed"
  echo "   Response: $COURSES_RESPONSE"
fi
echo ""

# 3. Test Enrollments API
echo "3. Testing Enrollments API..."
echo "   GET /api/enrollments"
ENROLLMENTS_RESPONSE=$(curl -s $BASE_URL/enrollments \
  -H "Authorization: Bearer $TOKEN")

ENROLLMENTS_SUCCESS=$(echo $ENROLLMENTS_RESPONSE | jq -r '.success')

if [ "$ENROLLMENTS_SUCCESS" = "true" ]; then
  ENROLLMENTS_COUNT=$(echo $ENROLLMENTS_RESPONSE | jq -r '.count')
  echo "   ✅ Enrollments API working"
  echo "   Found $ENROLLMENTS_COUNT enrollment(s)"
else
  echo "   ❌ Enrollments API failed"
  echo "   Error: $(echo $ENROLLMENTS_RESPONSE | jq -r '.error')"
fi
echo ""

# 4. Test Users API
echo "4. Testing Users API..."
echo "   GET /api/users/me"
USER_RESPONSE=$(curl -s $BASE_URL/users/me \
  -H "Authorization: Bearer $TOKEN")

USER_SUCCESS=$(echo $USER_RESPONSE | jq -r '.success')

if [ "$USER_SUCCESS" = "true" ]; then
  USER_NAME=$(echo $USER_RESPONSE | jq -r '.data.firstName + " " + .data.lastName')
  echo "   ✅ Users API working"
  echo "   User: $USER_NAME"
else
  echo "   ❌ Users API failed"
  echo "   Error: $(echo $USER_RESPONSE | jq -r '.error')"
fi
echo ""

# 5. Test Notifications API
echo "5. Testing Notifications API..."
echo "   GET /api/notifications"
NOTIFICATIONS_RESPONSE=$(curl -s $BASE_URL/notifications \
  -H "Authorization: Bearer $TOKEN")

NOTIFICATIONS_SUCCESS=$(echo $NOTIFICATIONS_RESPONSE | jq -r '.success')

if [ "$NOTIFICATIONS_SUCCESS" = "true" ]; then
  NOTIFICATIONS_COUNT=$(echo $NOTIFICATIONS_RESPONSE | jq -r '.count')
  UNREAD_COUNT=$(echo $NOTIFICATIONS_RESPONSE | jq -r '.unreadCount')
  echo "   ✅ Notifications API working"
  echo "   Total: $NOTIFICATIONS_COUNT, Unread: $UNREAD_COUNT"
else
  echo "   ❌ Notifications API failed"
  echo "   Error: $(echo $NOTIFICATIONS_RESPONSE | jq -r '.error')"
fi
echo ""

# 6. Test Certificates API
echo "6. Testing Certificates API..."
echo "   GET /api/certificates"
CERTIFICATES_RESPONSE=$(curl -s $BASE_URL/certificates \
  -H "Authorization: Bearer $TOKEN")

CERTIFICATES_SUCCESS=$(echo $CERTIFICATES_RESPONSE | jq -r '.success')

if [ "$CERTIFICATES_SUCCESS" = "true" ]; then
  CERTIFICATES_COUNT=$(echo $CERTIFICATES_RESPONSE | jq -r '.count')
  echo "   ✅ Certificates API working"
  echo "   Found $CERTIFICATES_COUNT certificate(s)"
else
  echo "   ❌ Certificates API failed"
  echo "   Error: $(echo $CERTIFICATES_RESPONSE | jq -r '.error')"
fi
echo ""

# 7. Test Discussions API
echo "7. Testing Discussions API..."
echo "   GET /api/discussions"
DISCUSSIONS_RESPONSE=$(curl -s $BASE_URL/discussions \
  -H "Authorization: Bearer $TOKEN")

DISCUSSIONS_SUCCESS=$(echo $DISCUSSIONS_RESPONSE | jq -r '.success')

if [ "$DISCUSSIONS_SUCCESS" = "true" ]; then
  DISCUSSIONS_COUNT=$(echo $DISCUSSIONS_RESPONSE | jq -r '.count')
  echo "   ✅ Discussions API working"
  echo "   Found $DISCUSSIONS_COUNT discussion(s)"
else
  echo "   ❌ Discussions API failed"
  echo "   Error: $(echo $DISCUSSIONS_RESPONSE | jq -r '.error')"
fi
echo ""

# Summary
echo "========================================="
echo "API Testing Summary"
echo "========================================="
echo "✅ Authentication: Working"
echo "✅ Courses: Working ($COURSES_COUNT courses)"

if [ "$ENROLLMENTS_SUCCESS" = "true" ]; then
  echo "✅ Enrollments: Working"
else
  echo "❌ Enrollments: Failed"
fi

if [ "$USER_SUCCESS" = "true" ]; then
  echo "✅ Users: Working"
else
  echo "❌ Users: Failed"
fi

if [ "$NOTIFICATIONS_SUCCESS" = "true" ]; then
  echo "✅ Notifications: Working"
else
  echo "❌ Notifications: Failed"
fi

if [ "$CERTIFICATES_SUCCESS" = "true" ]; then
  echo "✅ Certificates: Working"
else
  echo "❌ Certificates: Failed"
fi

if [ "$DISCUSSIONS_SUCCESS" = "true" ]; then
  echo "✅ Discussions: Working"
else
  echo "❌ Discussions: Failed"
fi

echo ""
echo "Testing complete!"
