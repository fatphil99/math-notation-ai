#!/bin/bash
# Test usage limit - make 6 requests with the same userId

USER_ID="test-limit-user-123"
API_URL="https://math-notation-ai-backend-production.up.railway.app/api/explain"

echo "Testing usage limit with userId: $USER_ID"
echo "Making 6 requests (limit is 5)..."
echo ""

for i in {1..6}; do
  echo "Request $i:"
  curl -X POST "$API_URL" \
    -H "Content-Type: application/json" \
    -d "{\"symbol\":\"x^$i\",\"userId\":\"$USER_ID\"}" \
    2>/dev/null | python3 -c "import sys, json; data=json.load(sys.stdin); print(f\"  Remaining: {data.get('remainingToday', 'N/A')}\" if 'error' not in data else f\"  ERROR: {data['error']}\")"
  echo ""
  sleep 1
done

echo "✅ Done! Request 6 should show an error about limit reached."
