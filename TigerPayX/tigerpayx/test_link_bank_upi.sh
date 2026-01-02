#!/bin/bash

# OnMeta API Key and Base URL
API_KEY="2fbe1c80-b6ae-438b-9052-d7d3bb3c06c4"
PROD_API_BASE_URL="https://api.platform.onmeta.in"

echo "Testing OnMeta Link Bank Account and Link UPI APIs"
echo "=================================================="
echo ""

# Note: These endpoints require an access token from user login
# First, we need to get an access token
echo "Step 1: Getting access token (requires valid email)..."
echo "------------------------------------------------------"
echo "Note: Replace 'test@example.com' with a valid test email"
echo ""

# Get access token (you'll need to replace with actual email)
EMAIL="test@example.com"
echo "Testing login with email: $EMAIL"
LOGIN_RESPONSE=$(curl -s --location "${PROD_API_BASE_URL}/v1/users/login" \
  --header "Content-Type: application/json" \
  --header "x-api-key: ${API_KEY}" \
  --data "{\"email\": \"${EMAIL}\"}")

echo "Login Response:"
echo "$LOGIN_RESPONSE" | jq '.' 2>/dev/null || echo "$LOGIN_RESPONSE"
echo ""

# Extract access token (if login was successful)
ACCESS_TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.accessToken // .access_token // empty' 2>/dev/null)

if [ -z "$ACCESS_TOKEN" ] || [ "$ACCESS_TOKEN" == "null" ]; then
  echo "⚠️  Could not get access token. Please check:"
  echo "   1. Email is valid and registered with OnMeta"
  echo "   2. API key has correct permissions"
  echo ""
  echo "Continuing with endpoint structure tests..."
  echo ""
else
  echo "✓ Access token obtained: ${ACCESS_TOKEN:0:20}..."
  echo ""
  
  echo "Step 2: Testing Link Bank Account endpoint structure..."
  echo "------------------------------------------------------"
  echo "Endpoint: ${PROD_API_BASE_URL}/v1/users/account-link"
  echo ""
  
  # Test link bank account (will likely fail without proper data, but shows endpoint structure)
  echo "Testing link bank account (this may fail without complete data):"
  LINK_BANK_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" --location "${PROD_API_BASE_URL}/v1/users/account-link" \
    --header "Content-Type: application/json" \
    --header "Authorization: Bearer ${ACCESS_TOKEN}" \
    --header "x-api-key: ${API_KEY}" \
    --data '{
      "name": "Test User",
      "panNumber": "ABCDE1234F",
      "email": "'"${EMAIL}"'",
      "kycVerified": true,
      "bankDetails": {
        "accountNumber": "1234567890",
        "ifscCode": "HDFC0001234",
        "accountHolderName": "Test User"
      },
      "phone": {
        "countryCode": "+91",
        "number": "9876543210"
      }
    }')
  
  HTTP_STATUS=$(echo "$LINK_BANK_RESPONSE" | grep "HTTP_STATUS:" | cut -d: -f2)
  RESPONSE_BODY=$(echo "$LINK_BANK_RESPONSE" | sed '/HTTP_STATUS:/d')
  
  echo "HTTP Status: $HTTP_STATUS"
  echo "Response:"
  echo "$RESPONSE_BODY" | jq '.' 2>/dev/null || echo "$RESPONSE_BODY"
  echo ""
  
  echo "Step 3: Testing Link UPI endpoint structure..."
  echo "------------------------------------------------------"
  echo "Endpoint: ${PROD_API_BASE_URL}/v1/users/upi-link"
  echo ""
  
  # Test link UPI (will likely fail without proper data, but shows endpoint structure)
  echo "Testing link UPI (this may fail without complete data):"
  LINK_UPI_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" --location "${PROD_API_BASE_URL}/v1/users/upi-link" \
    --header "Content-Type: application/json" \
    --header "Authorization: Bearer ${ACCESS_TOKEN}" \
    --header "x-api-key: ${API_KEY}" \
    --data '{
      "name": "Test User",
      "email": "'"${EMAIL}"'",
      "upiId": "test@upi"
    }')
  
  HTTP_STATUS=$(echo "$LINK_UPI_RESPONSE" | grep "HTTP_STATUS:" | cut -d: -f2)
  RESPONSE_BODY=$(echo "$LINK_UPI_RESPONSE" | sed '/HTTP_STATUS:/d')
  
  echo "HTTP Status: $HTTP_STATUS"
  echo "Response:"
  echo "$RESPONSE_BODY" | jq '.' 2>/dev/null || echo "$RESPONSE_BODY"
  echo ""
fi

echo "=================================================="
echo "Test Summary:"
echo "- Check if endpoints are correct (should be /v1/users/account-link and /v1/users/upi-link)"
echo "- Verify request body format matches OnMeta's expected format"
echo "- Check if all required fields are included"
echo ""

