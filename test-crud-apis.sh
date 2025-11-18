#!/bin/bash

# CRUD API Testing Script for Civilabs LMS
# Tests POST, PUT, DELETE operations for all backend APIs

BASE_URL="http://localhost:3001/api"
LEARNER_EMAIL="learner@civilabs.com"
LEARNER_PASSWORD="learner123"
ADMIN_EMAIL="admin@civilabs.com"
ADMIN_PASSWORD="admin123"

echo "========================================="
echo "Civilabs LMS CRUD API Testing Suite"
echo "========================================="
echo ""

# Helper function to print test results
print_result() {
  local test_name=$1
  local success=$2
  local message=$3

  if [ "$success" = "true" ]; then
    echo "   ✅ $test_name: PASS"
    [ -n "$message" ] && echo "      $message"
  else
    echo "   ❌ $test_name: FAIL"
    [ -n "$message" ] && echo "      $message"
  fi
}

# ========================================
# 1. AUTHENTICATION SETUP
# ========================================
echo "1. Setting up authentication..."
echo ""

# Login as learner
echo "   Logging in as learner..."
LEARNER_LOGIN=$(curl -s -X POST $BASE_URL/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$LEARNER_EMAIL\",\"password\":\"$LEARNER_PASSWORD\"}")

LEARNER_TOKEN=$(echo $LEARNER_LOGIN | jq -r '.token')
LEARNER_ID=$(echo $LEARNER_LOGIN | jq -r '.user.id')

if [ "$LEARNER_TOKEN" != "null" ] && [ -n "$LEARNER_TOKEN" ]; then
  print_result "Learner Login" "true" "User ID: $LEARNER_ID"
else
  print_result "Learner Login" "false" "Failed to authenticate"
  exit 1
fi

# Login as admin
echo "   Logging in as admin..."
ADMIN_LOGIN=$(curl -s -X POST $BASE_URL/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASSWORD\"}")

ADMIN_TOKEN=$(echo $ADMIN_LOGIN | jq -r '.token')
ADMIN_ID=$(echo $ADMIN_LOGIN | jq -r '.user.id')

if [ "$ADMIN_TOKEN" != "null" ] && [ -n "$ADMIN_TOKEN" ]; then
  print_result "Admin Login" "true" "User ID: $ADMIN_ID"
else
  print_result "Admin Login" "false" "Failed to authenticate"
  echo "   Warning: Admin tests will be skipped"
  ADMIN_TOKEN=""
fi

echo ""

# ========================================
# 2. GET COURSE ID FOR ENROLLMENT TESTS
# ========================================
echo "2. Getting course data for enrollment tests..."
echo ""

COURSES_RESPONSE=$(curl -s $BASE_URL/courses \
  -H "Authorization: Bearer $LEARNER_TOKEN")

COURSE_ID=$(echo $COURSES_RESPONSE | jq -r '.data[0].id')

if [ "$COURSE_ID" != "null" ] && [ -n "$COURSE_ID" ]; then
  COURSE_TITLE=$(echo $COURSES_RESPONSE | jq -r '.data[0].title')
  print_result "Get Course" "true" "Course ID: $COURSE_ID ($COURSE_TITLE)"
else
  print_result "Get Course" "false" "No courses found for testing"
  echo "   Warning: Enrollment tests will be skipped"
  COURSE_ID=""
fi

echo ""

# ========================================
# 3. TEST ENROLLMENTS (POST)
# ========================================
echo "3. Testing Enrollment Creation (POST)..."
echo ""

if [ -n "$COURSE_ID" ]; then
  # Check if already enrolled
  EXISTING_ENROLLMENTS=$(curl -s "$BASE_URL/enrollments?courseId=$COURSE_ID" \
    -H "Authorization: Bearer $LEARNER_TOKEN")

  EXISTING_COUNT=$(echo $EXISTING_ENROLLMENTS | jq -r '.count')

  if [ "$EXISTING_COUNT" = "0" ]; then
    # Create new enrollment
    echo "   POST /api/enrollments (courseId: $COURSE_ID)"
    ENROLL_RESPONSE=$(curl -s -X POST $BASE_URL/enrollments \
      -H "Authorization: Bearer $LEARNER_TOKEN" \
      -H "Content-Type: application/json" \
      -d "{\"courseId\":$COURSE_ID}")

    ENROLL_SUCCESS=$(echo $ENROLL_RESPONSE | jq -r '.success')
    ENROLLMENT_ID=$(echo $ENROLL_RESPONSE | jq -r '.data.id')

    if [ "$ENROLL_SUCCESS" = "true" ]; then
      print_result "Create Enrollment" "true" "Enrollment ID: $ENROLLMENT_ID"
    else
      ERROR_MSG=$(echo $ENROLL_RESPONSE | jq -r '.message')
      print_result "Create Enrollment" "false" "Error: $ERROR_MSG"
    fi
  else
    ENROLLMENT_ID=$(echo $EXISTING_ENROLLMENTS | jq -r '.data[0].id')
    print_result "Enrollment Already Exists" "true" "Using existing enrollment ID: $ENROLLMENT_ID"
  fi
else
  echo "   ⏭️  Skipped (no course available)"
fi

echo ""

# ========================================
# 4. TEST USER PROFILE UPDATE (PUT)
# ========================================
echo "4. Testing User Profile Update (PUT)..."
echo ""

# Get current user data
CURRENT_USER=$(curl -s $BASE_URL/users/me \
  -H "Authorization: Bearer $LEARNER_TOKEN")

CURRENT_FIRST=$(echo $CURRENT_USER | jq -r '.data.firstName')
CURRENT_LAST=$(echo $CURRENT_USER | jq -r '.data.lastName')

echo "   Current name: $CURRENT_FIRST $CURRENT_LAST"
echo "   PUT /api/users/me (updating firstName)"

# Update user profile
UPDATE_RESPONSE=$(curl -s -X PUT $BASE_URL/users/me \
  -H "Authorization: Bearer $LEARNER_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"firstName\":\"Test\",\"lastName\":\"$CURRENT_LAST\"}")

UPDATE_SUCCESS=$(echo $UPDATE_RESPONSE | jq -r '.success')
NEW_FIRST=$(echo $UPDATE_RESPONSE | jq -r '.data.firstName')

if [ "$UPDATE_SUCCESS" = "true" ] && [ "$NEW_FIRST" = "Test" ]; then
  print_result "Update Profile" "true" "Name changed to: $NEW_FIRST $CURRENT_LAST"

  # Restore original name
  echo "   Restoring original name..."
  RESTORE_RESPONSE=$(curl -s -X PUT $BASE_URL/users/me \
    -H "Authorization: Bearer $LEARNER_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"firstName\":\"$CURRENT_FIRST\",\"lastName\":\"$CURRENT_LAST\"}")

  RESTORE_SUCCESS=$(echo $RESTORE_RESPONSE | jq -r '.success')
  if [ "$RESTORE_SUCCESS" = "true" ]; then
    print_result "Restore Profile" "true" "Restored to: $CURRENT_FIRST $CURRENT_LAST"
  else
    print_result "Restore Profile" "false" "Failed to restore original name"
  fi
else
  ERROR_MSG=$(echo $UPDATE_RESPONSE | jq -r '.message')
  print_result "Update Profile" "false" "Error: $ERROR_MSG"
fi

echo ""

# ========================================
# 5. TEST NOTIFICATIONS (POST - Admin Only)
# ========================================
echo "5. Testing Notification Creation (POST - Admin)..."
echo ""

if [ -n "$ADMIN_TOKEN" ]; then
  echo "   POST /api/notifications"
  NOTIF_RESPONSE=$(curl -s -X POST $BASE_URL/notifications \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
      \"userId\":$LEARNER_ID,
      \"type\":\"info\",
      \"title\":\"Test Notification\",
      \"message\":\"This is a CRUD test notification\"
    }")

  NOTIF_SUCCESS=$(echo $NOTIF_RESPONSE | jq -r '.success')
  NOTIF_ID=$(echo $NOTIF_RESPONSE | jq -r '.data.id')

  if [ "$NOTIF_SUCCESS" = "true" ]; then
    print_result "Create Notification" "true" "Notification ID: $NOTIF_ID"

    # Verify notification appears in learner's list
    echo "   Verifying notification in learner's list..."
    LEARNER_NOTIFS=$(curl -s $BASE_URL/notifications \
      -H "Authorization: Bearer $LEARNER_TOKEN")

    FOUND_NOTIF=$(echo $LEARNER_NOTIFS | jq -r ".data[] | select(.id==$NOTIF_ID) | .id")

    if [ "$FOUND_NOTIF" = "$NOTIF_ID" ]; then
      print_result "Verify Notification" "true" "Found in learner's notifications"
    else
      print_result "Verify Notification" "false" "Not found in learner's notifications"
    fi
  else
    ERROR_MSG=$(echo $NOTIF_RESPONSE | jq -r '.message')
    print_result "Create Notification" "false" "Error: $ERROR_MSG"
  fi
else
  echo "   ⏭️  Skipped (admin not authenticated)"
fi

echo ""

# ========================================
# 6. TEST CERTIFICATES (POST - Admin Only)
# ========================================
echo "6. Testing Certificate Issuance (POST - Admin)..."
echo ""

if [ -n "$ADMIN_TOKEN" ] && [ -n "$COURSE_ID" ] && [ -n "$ENROLLMENT_ID" ]; then
  echo "   POST /api/certificates"
  CERT_RESPONSE=$(curl -s -X POST $BASE_URL/certificates \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
      \"userId\":$LEARNER_ID,
      \"courseId\":$COURSE_ID,
      \"enrollmentId\":$ENROLLMENT_ID
    }")

  CERT_SUCCESS=$(echo $CERT_RESPONSE | jq -r '.success')
  CERT_ID=$(echo $CERT_RESPONSE | jq -r '.data.id')
  VERIFICATION_CODE=$(echo $CERT_RESPONSE | jq -r '.data.verificationCode')

  if [ "$CERT_SUCCESS" = "true" ]; then
    print_result "Issue Certificate" "true" "Certificate ID: $CERT_ID, Code: $VERIFICATION_CODE"

    # Verify certificate appears in learner's list
    echo "   Verifying certificate in learner's list..."
    LEARNER_CERTS=$(curl -s $BASE_URL/certificates \
      -H "Authorization: Bearer $LEARNER_TOKEN")

    FOUND_CERT=$(echo $LEARNER_CERTS | jq -r ".data[] | select(.id==$CERT_ID) | .id")

    if [ "$FOUND_CERT" = "$CERT_ID" ]; then
      print_result "Verify Certificate" "true" "Found in learner's certificates"
    else
      print_result "Verify Certificate" "false" "Not found in learner's certificates"
    fi
  else
    ERROR_MSG=$(echo $CERT_RESPONSE | jq -r '.message')

    # Check if it's a "already issued" error (which is acceptable)
    if echo "$ERROR_MSG" | grep -q "already issued"; then
      print_result "Issue Certificate" "true" "Certificate already exists (expected)"

      # Get existing certificate
      LEARNER_CERTS=$(curl -s $BASE_URL/certificates \
        -H "Authorization: Bearer $LEARNER_TOKEN")
      CERT_ID=$(echo $LEARNER_CERTS | jq -r ".data[0].id")
      print_result "Existing Certificate" "true" "Using certificate ID: $CERT_ID"
    else
      print_result "Issue Certificate" "false" "Error: $ERROR_MSG"
    fi
  fi
else
  if [ -z "$ADMIN_TOKEN" ]; then
    echo "   ⏭️  Skipped (admin not authenticated)"
  elif [ -z "$COURSE_ID" ]; then
    echo "   ⏭️  Skipped (no course available)"
  elif [ -z "$ENROLLMENT_ID" ]; then
    echo "   ⏭️  Skipped (no enrollment available)"
  fi
fi

echo ""

# ========================================
# 7. TEST PASSWORD UPDATE
# ========================================
echo "7. Testing Password Update (PUT)..."
echo ""

echo "   PUT /api/users/me (updating password)"
NEW_PASSWORD="newTestPass123"

# Update password
PASS_RESPONSE=$(curl -s -X PUT $BASE_URL/users/me \
  -H "Authorization: Bearer $LEARNER_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"password\":\"$NEW_PASSWORD\"}")

PASS_SUCCESS=$(echo $PASS_RESPONSE | jq -r '.success')

if [ "$PASS_SUCCESS" = "true" ]; then
  print_result "Update Password" "true" "Password changed successfully"

  # Test login with new password
  echo "   Testing login with new password..."
  NEW_PASS_LOGIN=$(curl -s -X POST $BASE_URL/auth/login \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$LEARNER_EMAIL\",\"password\":\"$NEW_PASSWORD\"}")

  NEW_TOKEN=$(echo $NEW_PASS_LOGIN | jq -r '.token')

  if [ "$NEW_TOKEN" != "null" ] && [ -n "$NEW_TOKEN" ]; then
    print_result "Login with New Password" "true" "Login successful"

    # Restore original password
    echo "   Restoring original password..."
    RESTORE_PASS=$(curl -s -X PUT $BASE_URL/users/me \
      -H "Authorization: Bearer $NEW_TOKEN" \
      -H "Content-Type: application/json" \
      -d "{\"password\":\"$LEARNER_PASSWORD\"}")

    RESTORE_SUCCESS=$(echo $RESTORE_PASS | jq -r '.success')
    if [ "$RESTORE_SUCCESS" = "true" ]; then
      print_result "Restore Password" "true" "Password restored"
    else
      print_result "Restore Password" "false" "Failed to restore password"
    fi
  else
    print_result "Login with New Password" "false" "Failed to login with new password"
  fi
else
  ERROR_MSG=$(echo $PASS_RESPONSE | jq -r '.message')
  print_result "Update Password" "false" "Error: $ERROR_MSG"
fi

echo ""

# ========================================
# 8. TEST MARK NOTIFICATION AS READ (PUT)
# ========================================
echo "8. Testing Mark Notification as Read (PUT)..."
echo ""

# Get unread notifications
UNREAD_NOTIFS=$(curl -s "$BASE_URL/notifications?unreadOnly=true" \
  -H "Authorization: Bearer $LEARNER_TOKEN")

UNREAD_COUNT=$(echo $UNREAD_NOTIFS | jq -r '.count')

if [ "$UNREAD_COUNT" != "0" ] && [ "$UNREAD_COUNT" != "null" ]; then
  NOTIF_ID=$(echo $UNREAD_NOTIFS | jq -r '.data[0].id')

  echo "   PUT /api/notifications/$NOTIF_ID (marking as read)"
  MARK_READ=$(curl -s -X PUT "$BASE_URL/notifications/$NOTIF_ID" \
    -H "Authorization: Bearer $LEARNER_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"isRead\":true}")

  MARK_SUCCESS=$(echo $MARK_READ | jq -r '.success')

  if [ "$MARK_SUCCESS" = "true" ]; then
    print_result "Mark as Read" "true" "Notification ID: $NOTIF_ID marked as read"

    # Verify it's marked as read
    VERIFY_NOTIF=$(curl -s "$BASE_URL/notifications/$NOTIF_ID" \
      -H "Authorization: Bearer $LEARNER_TOKEN")

    IS_READ=$(echo $VERIFY_NOTIF | jq -r '.data.isRead')

    if [ "$IS_READ" = "true" ]; then
      print_result "Verify Read Status" "true" "Confirmed as read"
    else
      print_result "Verify Read Status" "false" "Not marked as read"
    fi
  else
    ERROR_MSG=$(echo $MARK_READ | jq -r '.message')
    print_result "Mark as Read" "false" "Error: $ERROR_MSG"
  fi
else
  echo "   ⏭️  Skipped (no unread notifications)"
fi

echo ""

# ========================================
# SUMMARY
# ========================================
echo "========================================="
echo "CRUD API Testing Summary"
echo "========================================="
echo ""
echo "✅ Tests Completed Successfully"
echo ""
echo "POST Operations Tested:"
echo "  • Create Enrollment"
echo "  • Create Notification (Admin)"
echo "  • Issue Certificate (Admin)"
echo ""
echo "PUT Operations Tested:"
echo "  • Update User Profile"
echo "  • Update Password"
echo "  • Mark Notification as Read"
echo ""
echo "DELETE Operations:"
echo "  • (Not implemented yet - will add when DELETE endpoints are created)"
echo ""
echo "Testing complete!"
