# Quick AI Setup Guide - 5 Minutes

## Step 1: Get OpenAI API Key (2 minutes)

1. Go to https://platform.openai.com/api-keys
2. Sign in or create account
3. Click "Create new secret key"
4. Name it "Portfoliosis Production"
5. Copy the key (starts with `sk-proj-...`)

## Step 2: Add to Environment (1 minute)

Open `.env.local` and add:

```bash
OPENAI_API_KEY=sk-proj-your-actual-key-here
```

## Step 3: Verify It Works (2 minutes)

```bash
# Test the API key
npx tsx scripts/diagnose-api-keys.ts
```

You should see:
```
✅ Working providers: OpenAI
```

## Step 4: Test AI Features (Optional but Recommended)

```bash
# Test all AI generation features
npx tsx scripts/test-ai-integration.ts
```

You should see successful generations for:
- ✓ Summary Generation (3 variations)
- ✓ Experience Enhancement
- ✓ Project Description
- ✓ Skills Suggestions

## Step 5: Test in UI

```bash
npm run dev
```

Navigate to: http://localhost:3011/dashboard/portfolios/new

Click "Generate with AI" buttons in the wizard to verify they work.

---

## Troubleshooting

**Error: "No AI providers working"**
- Make sure OPENAI_API_KEY is in .env.local
- Restart dev server after adding the key
- Run diagnostic script to verify

**Error: "Invalid API key"**
- Check for typos in the key
- Make sure there are no extra spaces
- Verify the key hasn't been revoked in OpenAI dashboard

**Error: "Rate limit exceeded"**
- You're making too many requests
- Wait a minute and try again
- Consider adding rate limiting in production

**High costs?**
- Set budget alerts in OpenAI dashboard
- Monitor usage in first week
- See full report for cost optimization strategies

---

## Cost Management

**Add Budget Alert:**
1. Go to https://platform.openai.com/settings/organization/billing/limits
2. Set monthly budget limit: $500
3. Set email alert at: $400 (80%)

**Expected Costs:**
- Development/Testing: $10-50/month
- Production (100 users): ~$110/month
- Production (1000 users): ~$2,200/month

See `AI_CONFIGURATION_REPORT.md` for detailed cost analysis.

---

## That's It!

Your AI features are now ready to use. For more details, see `AI_CONFIGURATION_REPORT.md`.
