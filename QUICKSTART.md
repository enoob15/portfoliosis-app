# Portfoliosis - Quick Start (Automated Setup)

**Get Portfoliosis running in 5 minutes!** 🚀

Everything is automated. You just need to provide your Supabase credentials.

---

## Option 1: One-Command Setup (Windows) ⚡

**Easiest way - runs everything automatically:**

```bash
setup.bat
```

This will:
1. ✅ Check Node.js is installed
2. ✅ Install npm dependencies
3. ✅ Run Supabase setup wizard
4. ✅ Create `.env.local` file
5. ✅ Test connection
6. ✅ Verify database tables

**Then just run:**
```bash
npm run dev
```

---

## Option 2: Step-by-Step (Manual Control)

### Step 1: Install Dependencies

```bash
cd C:\GitHub\portfoliosis-app
npm install
```

### Step 2: Get Supabase Credentials

1. Go to [supabase.com](https://supabase.com)
2. Create account (or log in)
3. Click **"New Project"**
   - Name: `portfoliosis-dev`
   - Password: Generate strong password (save it!)
   - Region: Choose closest to you
   - Wait 2-3 minutes for setup

4. Go to **Settings > API**
5. Copy these 3 values:
   - **URL** (looks like `https://xxxxx.supabase.co`)
   - **anon public** key (starts with `eyJ...`)
   - **service_role** key (starts with `eyJ...`)

### Step 3: Run Automated Setup

```bash
npm run setup
```

The script will:
- ✅ Ask for your Supabase credentials
- ✅ Create `.env.local` file
- ✅ Test connection
- ✅ Run database migration
- ✅ Verify everything works

**That's it!** You're done.

### Step 4: Start Development Server

```bash
npm run dev
```

Open: http://localhost:3000

---

## Troubleshooting

### Migration Fails During Setup?

No problem! Run it manually:

```bash
npm run copy:migration
```

This copies the SQL to your clipboard. Then:
1. Go to Supabase Dashboard → **SQL Editor**
2. Click **"New query"**
3. Paste (Ctrl+V)
4. Click **"Run"**

### Want to Test Your Setup?

```bash
npm run test:supabase
```

This checks:
- ✅ `.env.local` exists
- ✅ Credentials are valid
- ✅ Can connect to Supabase
- ✅ All tables exist
- ✅ Templates are seeded
- ✅ Storage bucket ready

### Need to Reconfigure?

Delete `.env.local` and run setup again:

```bash
rm .env.local
npm run setup
```

---

## Available Commands

```bash
# Setup & Testing
npm run setup           # Automated Supabase setup wizard
npm run test:supabase   # Test connection and verify setup
npm run copy:migration  # Copy SQL to clipboard for manual migration

# Development
npm run dev             # Start dev server (http://localhost:3000)
npm run build           # Build for production
npm run start           # Start production server
npm run lint            # Run linter

# One-command (Windows only)
setup.bat               # Full automated setup
```

---

## What Gets Automated?

### ✅ Fully Automated:
- Installing dependencies (`npm install`)
- Creating `.env.local` with your credentials
- Testing Supabase connection
- Verifying tables exist
- Checking templates are seeded
- Checking storage bucket

### ⚠️ Semi-Automated (might need manual step):
- Database migration (auto-attempted, manual fallback provided)

### ❌ Manual (one-time, 5 minutes):
- Creating Supabase account
- Creating Supabase project
- Getting API credentials

---

## First Time Use - Complete Flow

**1. Create Supabase Project (5 min)**
   - Visit: https://supabase.com
   - Create project, get credentials

**2. Run Setup (2 min)**
   ```bash
   setup.bat   # or: npm run setup
   ```

**3. Start App (instant)**
   ```bash
   npm run dev
   ```

**4. Test It (2 min)**
   - Visit: http://localhost:3000
   - Click "Sign up"
   - Create account
   - Create portfolio
   - Upload resume

**Total time: ~10 minutes** ⚡

---

## File Structure (Setup Files)

```
portfoliosis-app/
├── setup.bat                      # Windows one-command setup
├── QUICKSTART.md                  # This file
├── SETUP_INSTRUCTIONS.md          # Detailed manual setup guide
├── scripts/
│   ├── setup-supabase.js         # Interactive setup wizard
│   ├── test-supabase.js          # Connection test suite
│   └── copy-migration-sql.js     # Copy SQL to clipboard
├── supabase/
│   └── migrations/
│       └── 20260111_initial_schema.sql  # Database schema
└── .env.local                     # (Created by setup - not in git)
```

---

## Environment Variables Explained

Your `.env.local` file (created by setup):

```bash
# Required for app to work
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co  # Your project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...              # Public API key
SUPABASE_SERVICE_ROLE_KEY=eyJ...                  # Admin key (keep secret!)

# Optional - for Phase 2 (AI features)
# OPENAI_API_KEY=sk-...
# ANTHROPIC_API_KEY=sk-ant-...
# GOOGLE_AI_API_KEY=AIza...
```

---

## What Setup Creates

**1. `.env.local` file**
   - Your Supabase credentials
   - Environment configuration
   - **Not committed to git** (in .gitignore)

**2. Database tables:**
   - `portfolios` - Your portfolio data
   - `ai_jobs` - AI processing jobs
   - `portfolio_versions` - Version history
   - `templates` - Pre-built templates (5 seeded)
   - `portfolio_analytics` - Usage analytics

**3. Storage bucket:**
   - `portfolios` - For uploaded resume files

**4. Templates:**
   - Tech Professional
   - Creative Director
   - Business Executive
   - Academic Researcher
   - Freelancer

---

## Pro Tips

### 1. Keep Service Role Key Secret
The service role key has admin access. Never commit it to git or share it publicly.

### 2. Free Tier is Generous
- 500MB database
- 1GB file storage
- 50,000 monthly active users
- You won't need to pay for development

### 3. Test Before Coding
Always run `npm run test:supabase` after setup to verify everything works.

### 4. Migration is Idempotent
Running the migration multiple times is safe - it won't duplicate data.

---

## Common Issues

### "Module not found"
**Solution:** Run `npm install`

### "Missing Supabase environment variables"
**Solution:** Run `npm run setup` to create `.env.local`

### "Connection refused"
**Solution:**
1. Check your Supabase project is running (go to dashboard)
2. Verify credentials in `.env.local`
3. Run `npm run test:supabase` to diagnose

### Migration SQL fails
**Solution:** Use manual approach:
```bash
npm run copy:migration
```
Then paste in Supabase SQL Editor

---

## Next Steps After Setup

### Test the App:
1. **Sign up** - Create account (http://localhost:3000/signup)
2. **Log in** - Test authentication
3. **Create portfolio** - Click "Create Portfolio"
4. **Upload resume** - Drag-and-drop PDF/DOCX
5. **View dashboard** - See your portfolio

### Start Development:
- Phase 2: AI Engine (resume parsing)
- Phase 3: Templates (5 designs)
- Phase 4: Editor (customization)
- Phase 5: Deployment (Vercel/Netlify)

---

## Support

**Documentation:**
- Full setup guide: `SETUP_INSTRUCTIONS.md`
- Project summary: `PORTFOLIOSIS_WEEK_2-3_COMPLETE.md`

**Supabase Resources:**
- Dashboard: https://supabase.com/dashboard
- Docs: https://supabase.com/docs
- SQL Editor: Dashboard → SQL Editor

**Need Help?**
- Test your setup: `npm run test:supabase`
- Re-run setup: Delete `.env.local` and run `npm run setup`

---

**Ready?** Run `setup.bat` or `npm run setup` to get started! 🚀

---

*Setup automation built by Claude Code*
*Date: January 11, 2026*
