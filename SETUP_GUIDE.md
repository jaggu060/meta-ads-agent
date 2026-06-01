# Meta Ads Agent — Complete Setup Guide

## What you'll have at the end
- A PWA app installable on any Android phone (no Play Store)
- Hosted free on Vercel
- Your buddy just opens a link and installs it

---

## STEP 1 — Install Node.js on your PC (one time)

1. Go to https://nodejs.org
2. Download the **LTS version** (green button)
3. Run the installer, click Next → Next → Finish
4. Open Command Prompt (press Win+R, type `cmd`, press Enter)
5. Type: `node --version` → should show v18 or higher ✅

---

## STEP 2 — Install Git (one time)

1. Go to https://git-scm.com/download/win
2. Download and install (all defaults are fine)
3. In Command Prompt, type: `git --version` → should show a version ✅

---

## STEP 3 — Create a GitHub account (one time)

1. Go to https://github.com
2. Click Sign Up, create a free account
3. Verify your email

---

## STEP 4 — Upload the project to GitHub

1. In Command Prompt, navigate to the project folder:
   ```
   cd path\to\meta-ads-agent
   ```
   (e.g. if you unzipped to Downloads: `cd C:\Users\YourName\Downloads\meta-ads-agent`)

2. Run these commands one by one:
   ```
   git init
   git add .
   git commit -m "initial commit"
   ```

3. Go to https://github.com/new
4. Name it `meta-ads-agent`, keep it **Private**, click **Create repository**
5. GitHub will show you commands. Run the ones under "push an existing repository":
   ```
   git remote add origin https://github.com/YOURUSERNAME/meta-ads-agent.git
   git branch -M main
   git push -u origin main
   ```
6. Refresh GitHub — you should see all your files ✅

---

## STEP 5 — Deploy to Vercel (free hosting)

1. Go to https://vercel.com
2. Click **Sign Up** → **Continue with GitHub**
3. Click **Add New Project**
4. Select your `meta-ads-agent` repository → click **Import**
5. Leave all settings as default
6. Click **Deploy** — wait ~60 seconds
7. Vercel gives you a URL like: `https://meta-ads-agent-abc123.vercel.app` ✅

---

## STEP 6 — Add your API Keys to Vercel (keeps them secret)

In your Vercel project dashboard:
1. Go to **Settings** → **Environment Variables**
2. Add these one by one:

   | Name | Value |
   |------|-------|
   | `ANTHROPIC_API_KEY` | `sk-ant-...` (from console.anthropic.com) |
   | `META_ACCESS_TOKEN` | `EAAxxxxx...` (from Meta developer portal) |
   | `META_AD_ACCOUNT_ID` | `act_123456789` (from Meta Business Manager) |

3. Click **Save** after each one
4. Go to **Deployments** → click **Redeploy** (so the keys take effect)

---

## STEP 7 — Install on Android Phone (you AND your buddy)

1. Open **Chrome** on Android
2. Visit your Vercel URL (e.g. `https://meta-ads-agent-abc123.vercel.app`)
3. Tap the **3-dot menu** (top right of Chrome)
4. Tap **"Add to Home screen"**
5. Tap **"Add"**
6. The app icon appears on your home screen — tap it to open ✅

It opens like a real app — no browser bar, full screen, works like native.

---

## STEP 8 — Share with your buddy

Just send him the Vercel URL on WhatsApp.
He follows Step 7 (Add to Home screen) on his Android.
He can use it in Demo Mode (no credentials needed) OR you can set up Meta + Anthropic keys inside the app settings.

---

## Getting your API credentials

### Anthropic API Key
1. Go to https://console.anthropic.com
2. Click **API Keys** in sidebar
3. Click **Create Key**
4. Copy it — starts with `sk-ant-`
5. Add your card in **Billing** (you get charged only for usage, ~₹1-5/month for personal use)

### Meta Access Token
1. Go to https://developers.facebook.com
2. Create an App → select **Business** type
3. Go to **Tools** → **Graph API Explorer**
4. Select your app, click **Generate Access Token**
5. Add permissions: `ads_management`, `ads_read`, `business_management`
6. Copy the token
7. For a long-lived token: https://developers.facebook.com/tools/debug/accesstoken/

### Meta Ad Account ID
1. Go to https://business.facebook.com
2. Click **Ad Accounts** in the sidebar
3. Your account ID is shown (e.g. `123456789`)
4. Add `act_` prefix: `act_123456789`

---

## Updating the app later

Whenever you make changes:
```
git add .
git commit -m "update"
git push
```
Vercel auto-deploys in ~30 seconds. Everyone sees the update immediately.

---

## Troubleshooting

**"npm not found"** → Re-install Node.js, restart Command Prompt

**"git not found"** → Re-install Git, restart Command Prompt

**App shows error on launch** → Check Vercel → Functions tab for error logs

**Meta API error** → Token may have expired. Regenerate at developers.facebook.com

**Claude not responding** → Check your ANTHROPIC_API_KEY in Vercel environment variables
