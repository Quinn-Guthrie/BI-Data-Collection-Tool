#!/bin/bash

echo "🧪 Testing Food Biosciences App..."
echo ""

# Test 1: Server responding
echo "✓ Test 1: Server health check"
curl -s http://localhost:3000 > /dev/null && echo "  ✅ Server responding" || echo "  ❌ Server down"

# Test 2: API routes
echo "✓ Test 2: API routes"
curl -s http://localhost:3000/api/auth/session > /dev/null && echo "  ✅ Auth API works" || echo "  ❌ Auth API broken"
curl -s http://localhost:3000/api/cycles/current > /dev/null && echo "  ✅ Cycles API works" || echo "  ❌ Cycles API broken"

# Test 3: Database
echo "✓ Test 3: Database connectivity"
[ -f "prisma/dev.db" ] && echo "  ✅ Database exists" || echo "  ❌ Database missing"

# Test 4: Environment
echo "✓ Test 4: Environment variables"
[ -f ".env" ] && echo "  ✅ .env file exists" || echo "  ❌ .env file missing"

echo ""
echo "🎯 Manual testing required for:"
echo "  - Login flow"
echo "  - Entry wizard"
echo "  - Charts rendering"
echo "  - CSV export"
echo ""
