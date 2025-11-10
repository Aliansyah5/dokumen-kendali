# 🔄 Supabase Keep-Alive Setup Guide

## What This Does

Keeps your Supabase database active by periodically pinging it, preventing cold starts and ensuring fast response times.

---

## ✅ Files Already Created

1. **`api/keep-alive.ts`** - Vercel serverless function for keep-alive
2. **`src/services/SupabaseKeepAlive.ts`** - Keep-alive service function

---

## 🚀 Quick Setup (3 Steps)

### Step 1: Deploy to Vercel

```bash
vercel --prod
```

Your keep-alive endpoint will be at:

```
https://your-domain.vercel.app/api/keep-alive
```

### Step 2: Test the Endpoint

```bash
curl https://your-domain.vercel.app/api/keep-alive
```

Expected response:

```json
{
  "status": "awake",
  "timestamp": "2025-11-10T10:30:00.000Z",
  "responseTime": 245,
  "tables": {
    "timeline_schedules": "ok",
    "document_links": "ok"
  },
  "message": "✅ Supabase is awake and responsive"
}
```

### Step 3: Setup Cron Job

---

## 🌐 Cron Job Options

**⚠️ Penting**: Vercel Cron memerlukan paket berbayar. Gunakan layanan cron gratis eksternal di bawah ini.

---

### Option 1: cron-job.org (Gratis & Direkomendasikan)

1. **Go to**: https://cron-job.org
2. **Create account** (free)
3. **Add new cron job**:
   - Title: `Supabase Keep-Alive`
   - URL: `https://your-domain.vercel.app/api/keep-alive`
   - Schedule: Every 10 minutes
   - HTTP Method: GET
   - Enable: ✅

**Cron Expression**: `*/10 * * * *`

---

### Option 2: EasyCron (Free Tier)

1. **Go to**: https://www.easycron.com
2. **Sign up** (free plan: 100 executions/day)
3. **Create cron job**:
   - Cron Expression: `*/10 * * * *`
   - URL to call: `https://your-domain.vercel.app/api/keep-alive`
   - Cron Job Name: `Supabase Keep-Alive`

---

### Option 3: UptimeRobot (Free Monitoring)

1. **Go to**: https://uptimerobot.com
2. **Add New Monitor**:
   - Monitor Type: HTTP(s)
   - Friendly Name: `Supabase Keep-Alive`
   - URL: `https://your-domain.vercel.app/api/keep-alive`
   - Monitoring Interval: 5 minutes

**Bonus**: Get email/SMS alerts if endpoint fails!

---

### Option 4: Pipedream (Advanced)

1. **Go to**: https://pipedream.com
2. **Create new workflow**
3. **Add Schedule trigger**: Every 5 minutes
4. **Add HTTP Request step**:
   ```javascript
   await require("@pipedreamhq/platform").axios(this, {
     url: "https://your-domain.vercel.app/api/keep-alive",
     method: "GET",
   });
   ```

---

## 📊 Monitoring & Alerts

### Setup Slack Notifications

**Using Zapier:**

1. Trigger: Scheduled (every 5 minutes)
2. Action: HTTP Request to your endpoint
3. Filter: If status !== "awake"
4. Send Slack message

**Using Make.com (Integromat):**

1. Schedule: Every 5 minutes
2. HTTP Request: GET your endpoint
3. Router: If status === "error"
4. Slack: Post alert to channel

---

## 🔍 Testing Locally

Since you can't run TypeScript serverless functions directly, test the service function:

Create test file `test-keep-alive.ts`:

```typescript
import { keepSupabaseAwake } from "./src/services/SupabaseKeepAlive";

async function test() {
  console.log("Testing Supabase keep-alive...");
  const result = await keepSupabaseAwake();
  console.log(JSON.stringify(result, null, 2));
}

test();
```

Run:

```bash
npx ts-node test-keep-alive.ts
```

---

## 📅 Recommended Schedule

| Frequency    | Cron Expression | Use Case                     |
| ------------ | --------------- | ---------------------------- |
| Every 5 min  | `*/5 * * * *`   | High traffic apps            |
| Every 10 min | `*/10 * * * *`  | Medium traffic (Recommended) |
| Every 15 min | `*/15 * * * *`  | Low traffic                  |
| Every 30 min | `*/30 * * * *`  | Minimal usage                |

**Recommended**: `*/10 * * * *` (every 10 minutes)

---

## 🎯 Response Examples

### ✅ Success (All Tables OK)

```json
{
  "status": "awake",
  "timestamp": "2025-11-10T10:30:00.000Z",
  "responseTime": 245,
  "tables": {
    "timeline_schedules": "ok",
    "document_links": "ok"
  },
  "message": "✅ Supabase is awake and responsive"
}
```

### ⚠️ Partial (Some Tables Down)

```json
{
  "status": "partial",
  "timestamp": "2025-11-10T10:30:00.000Z",
  "responseTime": 1240,
  "tables": {
    "timeline_schedules": "ok",
    "document_links": "error"
  },
  "message": "⚠️ Partial response from Supabase"
}
```

### ❌ Error (All Down)

```json
{
  "status": "error",
  "timestamp": "2025-11-10T10:30:00.000Z",
  "responseTime": 5000,
  "error": "Connection timeout",
  "message": "❌ Failed to ping Supabase"
}
```

---

## 🛠️ Troubleshooting

### Endpoint Returns 500 Error

- Check Supabase URL and keys in Vercel environment variables
- Verify tables exist: `timeline_schedules`, `document_links`
- Check Supabase dashboard for connection issues

### Cron Job Not Running

- Verify cron service is enabled
- Check cron expression is correct
- Look at execution logs in cron service dashboard

### Slow Response Times

- Normal: 200-500ms
- Acceptable: 500ms-2s
- Slow: >2s - May indicate Supabase cold start

---

## 💡 Best Practices

1. **Monitor Response Times**: Track how long pings take
2. **Set Alerts**: Get notified if endpoint fails
3. **Log History**: Keep track of uptime/downtime
4. **Use Multiple Services**: Redundancy if one cron service fails
5. **Check Supabase Dashboard**: Monitor database metrics

---

## 📱 Mobile App Integration (Optional)

Add to your React app to ping on user activity:

```typescript
import { useEffect } from "react";
import { keepSupabaseAwake } from "./services/SupabaseKeepAlive";

function App() {
  useEffect(() => {
    // Ping once when app loads
    keepSupabaseAwake();

    // Ping every 5 minutes while app is open
    const interval = setInterval(keepSupabaseAwake, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return <YourApp />;
}
```

---

## 🎉 You're Done!

Your Supabase database will now stay awake and responsive 24/7!

**Quick Checklist:**

- ✅ Deploy to Vercel
- ✅ Test endpoint works
- ✅ Setup cron job (choose one service)
- ✅ Verify pings are happening
- ✅ (Optional) Setup monitoring/alerts

For detailed health monitoring, use:

```
https://your-domain.vercel.app/api/health/supabase-ping
```

See `CRON_JOB_SETUP.md` for more monitoring options.
