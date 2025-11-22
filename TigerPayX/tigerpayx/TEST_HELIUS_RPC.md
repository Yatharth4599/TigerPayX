# 🧪 Test Your Helius RPC

## Quick Test

Open your browser console (F12) and run this:

```javascript
// Test your Helius RPC
fetch('https://mainnet.helius-rpc.com/?api-key=4f2ffa37-a1ad-46ab-b5c5-dd4b67f6b8be', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    jsonrpc: '2.0',
    id: 1,
    method: 'getHealth'
  })
})
.then(r => {
  console.log('Status:', r.status);
  return r.json();
})
.then(data => {
  console.log('Response:', data);
  if (data.result === 'ok') {
    console.log('✅ Helius RPC is working!');
  } else {
    console.log('❌ Helius RPC error:', data);
  }
})
.catch(err => {
  console.error('❌ Error:', err);
  if (err.message.includes('CORS') || err.name === 'TypeError') {
    console.error('🚫 CORS Error - Helius RPC is blocked by browser');
    console.log('💡 Solution: Try QuickNode instead (no CORS issues)');
  }
});
```

## What to Look For

### ✅ If it works:
- Status: 200
- Response: `{"jsonrpc":"2.0","result":"ok","id":1}`
- **Your API key is valid!**

### ❌ If it fails:

**CORS Error:**
- Error: `TypeError: Failed to fetch`
- **Solution:** Helius might have CORS restrictions. Try **QuickNode** instead.

**401/403 Error:**
- Status: 401 or 403
- **Solution:** Your API key is invalid. Regenerate it in Helius dashboard.

**Network Error:**
- Error: `ERR_CONNECTION` or timeout
- **Solution:** Network issue. Check your internet connection.

## Alternative: QuickNode (Recommended)

If Helius has CORS issues, QuickNode is more reliable:

1. **Sign up:** https://www.quicknode.com/
2. **Create endpoint:**
   - Select Solana
   - Select Mainnet
   - Choose Free tier
3. **Copy HTTP endpoint URL**
4. **Update Vercel:**
   - Variable: `NEXT_PUBLIC_SOLANA_RPC_URL`
   - Value: Your QuickNode URL
5. **Redeploy**

QuickNode format:
```
https://your-endpoint.solana-mainnet.quiknode.pro/YOUR_KEY
```

## Why Helius Might Fail

1. **CORS restrictions** - Browser blocks the request
2. **Invalid API key** - Key expired or wrong
3. **Rate limit exceeded** - Check Helius dashboard
4. **Network issues** - Firewall or connectivity

## Next Steps

1. **Test your Helius RPC** using the script above
2. **If CORS error:** Switch to QuickNode
3. **If API key invalid:** Regenerate in Helius dashboard
4. **Update Vercel** with correct RPC URL
5. **Redeploy** your app

---

**QuickNode is often more reliable** and has better browser compatibility. Consider switching if Helius continues to fail.

