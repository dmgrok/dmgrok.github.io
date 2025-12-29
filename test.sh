#!/bin/bash
# Test script for Adaptive Profile Page
# Run: ./test.sh

BASE_URL="${1:-http://localhost:8000}"
PASS=0
FAIL=0

echo "🧪 Testing Adaptive Profile Page"
echo "================================"
echo "Base URL: $BASE_URL"
echo ""

# Test function
test_url() {
    local name="$1"
    local url="$2"
    local expected="$3"
    
    response=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null)
    
    if [ "$response" == "$expected" ]; then
        echo "✅ $name (HTTP $response)"
        ((PASS++))
    else
        echo "❌ $name (Expected $expected, got $response)"
        ((FAIL++))
    fi
}

# Test content function
test_content() {
    local name="$1"
    local url="$2"
    local search="$3"
    
    if curl -s "$url" 2>/dev/null | grep -q "$search"; then
        echo "✅ $name"
        ((PASS++))
    else
        echo "❌ $name (missing: $search)"
        ((FAIL++))
    fi
}

echo "📄 Page Load Tests"
echo "------------------"
test_url "Main page" "$BASE_URL/" "200"
test_url "Styles" "$BASE_URL/styles.css" "200"
test_url "Adaptive JS" "$BASE_URL/adaptive.js" "200"
test_url "English i18n" "$BASE_URL/i18n/en.json" "200"
test_url "French i18n" "$BASE_URL/i18n/fr.json" "200"
test_url "Portuguese i18n" "$BASE_URL/i18n/pt.json" "200"
test_url "Spanish i18n" "$BASE_URL/i18n/es.json" "200"
test_url "Greetings" "$BASE_URL/i18n/greetings.json" "200"
test_url "Profile photo" "$BASE_URL/assets/profile.jpg" "200"
test_url "404 page" "$BASE_URL/404.html" "200"
test_url "Sitemap" "$BASE_URL/sitemap.xml" "200"

echo ""
echo "🔍 Content Tests"
echo "----------------"
test_content "Has name" "$BASE_URL/" "David Graça"
test_content "Has title" "$BASE_URL/" "AI for SDLC"
test_content "Has AXA" "$BASE_URL/" "AXA"
test_content "Has LinkedIn" "$BASE_URL/" "linkedin.com/in/davidgraca"
test_content "Has GitHub" "$BASE_URL/" "github.com/dmgrok"
test_content "Has skip link" "$BASE_URL/" "skip-link"
test_content "Has ARIA" "$BASE_URL/" "aria-live"
test_content "Has privacy modal" "$BASE_URL/" "privacy-modal"

echo ""
echo "🔗 Visitor Type URLs"
echo "--------------------"
test_url "Recruiter (?r=li)" "$BASE_URL/?r=li" "200"
test_url "Speaker (?r=sp)" "$BASE_URL/?r=sp" "200"
test_url "Developer (?r=gh)" "$BASE_URL/?r=gh" "200"
test_url "Executive (?r=ex)" "$BASE_URL/?r=ex" "200"
test_url "In-person (?r=qr)" "$BASE_URL/?r=qr" "200"
test_url "Debug mode (?debug=1)" "$BASE_URL/?debug=1" "200"

echo ""
echo "📊 Results"
echo "----------"
echo "Passed: $PASS"
echo "Failed: $FAIL"
echo ""

if [ $FAIL -eq 0 ]; then
    echo "🎉 All tests passed!"
    exit 0
else
    echo "⚠️  Some tests failed"
    exit 1
fi
