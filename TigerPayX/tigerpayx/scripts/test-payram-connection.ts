// Test PayRam connection and API endpoints

import { PAYRAM_CONFIG } from "@/shared/config";

async function testPayRamConnection() {
  console.log("🧪 Testing PayRam Connection");
  console.log("============================\n");

  if (!PAYRAM_CONFIG.enabled || !PAYRAM_CONFIG.apiUrl) {
    console.log("❌ PayRam is not configured");
    console.log("Set PAYRAM_API_URL in .env file");
    return;
  }

  console.log(`📍 PayRam URL: ${PAYRAM_CONFIG.apiUrl}\n`);

  // Test 1: Basic connectivity
  console.log("Test 1: Basic Connectivity");
  try {
    const response = await fetch(PAYRAM_CONFIG.apiUrl, {
      method: "GET",
    });
    console.log(`   Status: ${response.status}`);
    console.log(`   ✅ PayRam is reachable\n`);
  } catch (error: any) {
    console.log(`   ❌ Cannot reach PayRam: ${error.message}\n`);
    return;
  }

  // Test 2: Health check (if available)
  console.log("Test 2: Health Check");
  try {
    const healthUrl = `${PAYRAM_CONFIG.apiUrl}/health`;
    const response = await fetch(healthUrl);
    if (response.ok) {
      const data = await response.json();
      console.log(`   ✅ Health check passed:`, data);
    } else {
      console.log(`   ⚠️  Health endpoint not available (status: ${response.status})`);
    }
    console.log("");
  } catch (error: any) {
    console.log(`   ⚠️  Health endpoint not available: ${error.message}\n`);
  }

  // Test 3: API endpoint check
  console.log("Test 3: API Endpoints");
  const endpoints = [
    "/api/merchants",
    "/api/verify",
    "/merchants",
    "/verify",
    "/v1/merchants",
  ];

  for (const endpoint of endpoints) {
    try {
      const url = `${PAYRAM_CONFIG.apiUrl}${endpoint}`;
      const response = await fetch(url, {
        method: "GET",
      });
      console.log(`   ${endpoint}: ${response.status} ${response.statusText}`);
    } catch (error: any) {
      console.log(`   ${endpoint}: ❌ ${error.message}`);
    }
  }
  console.log("");

  // Test 4: Merchant registration (test endpoint)
  console.log("Test 4: Merchant Registration Endpoint");
  try {
    const testMerchant = {
      name: "Test Merchant",
      settlementAddress: "So11111111111111111111111111111111111111112",
      preferredToken: "USDC",
    };

    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (PAYRAM_CONFIG.apiKey) {
      headers["Authorization"] = `Bearer ${PAYRAM_CONFIG.apiKey}`;
    }

    // Try different endpoint patterns
    const endpoints = [
      "/api/merchants",
      "/merchants",
      "/v1/merchants",
    ];

    for (const endpoint of endpoints) {
      try {
        const url = `${PAYRAM_CONFIG.apiUrl}${endpoint}`;
        const response = await fetch(url, {
          method: "POST",
          headers,
          body: JSON.stringify(testMerchant),
        });

        if (response.ok) {
          const data = await response.json();
          console.log(`   ✅ ${endpoint} works!`);
          console.log(`   Response:`, JSON.stringify(data, null, 2));
          break;
        } else {
          const errorText = await response.text();
          console.log(`   ⚠️  ${endpoint}: ${response.status} - ${errorText.substring(0, 100)}`);
        }
      } catch (error: any) {
        console.log(`   ❌ ${endpoint}: ${error.message}`);
      }
    }
  } catch (error: any) {
    console.log(`   ❌ Error: ${error.message}`);
  }

  console.log("\n✅ Testing complete!");
}

// Run if called directly
if (require.main === module) {
  testPayRamConnection().catch(console.error);
}

export { testPayRamConnection };

