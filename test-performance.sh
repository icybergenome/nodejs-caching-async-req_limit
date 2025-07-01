#!/bin/bash

# Performance Test Script for User Data API
# This script demonstrates the caching, rate limiting, and queue functionality

echo "🚀 User Data API Performance Test"
echo "=================================="
echo ""

# Test 1: Basic functionality
echo "1. Testing basic user retrieval..."
curl -s http://localhost:3000/users/1 | jq .cached
echo ""

echo "2. Testing cache hit..."
curl -s http://localhost:3000/users/1 | jq .cached
echo ""

# Test 2: Performance comparison
echo "3. Testing performance (cache miss vs hit)..."
echo "Cache miss timing:"
time curl -s http://localhost:3000/users/2 > /dev/null
echo "Cache hit timing:"
time curl -s http://localhost:3000/users/2 > /dev/null
echo ""

# Test 3: Cache status
echo "4. Cache statistics:"
curl -s http://localhost:3000/cache/status | jq .cache
echo ""

# Test 4: User creation
echo "5. Creating new user..."
curl -s -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Performance Test User","email":"test@performance.com"}' | jq .data
echo ""

# Test 5: Rate limiting demonstration (commented out to avoid hitting limits)
echo "6. Testing rate limiting (this will trigger 429 responses)..."
for i in {1..12}; do
  response=$(curl -s -w "%{http_code}" http://localhost:3000/users/1 -o /dev/null)
  echo "Request $i: HTTP $response"
done
echo ""

echo "✅ Performance test completed!"
echo "💡 To test rate limiting, uncomment the rate limiting section in this script."
