# Deployment Guide: Manus Analytics on Render.com

This guide describes how to deploy the unified Manus Analytics service—FastAPI keep-alive web endpoint and Telegram bot—on Render.com.

### **Prerequisites**

1. Render.com account with the Free plan.
2. GitHub repository containing the project with `render.yaml` in the root.
3. Telegram Bot token and admin user ID.
4. MongoDB connection string (e.g., MongoDB Atlas cluster).

### **Step 1: Create the Blueprint Service**

1. Open your Render dashboard and click **"New +" → "Blueprint"**.
2. Connect your GitHub account and select the Manus Analytics repository.
3. Render reads `render.yaml` and proposes a single service named `manus-analytics-service`.
4. Confirm the settings and click **"Apply"**. The blueprint creates one web service that runs both the FastAPI health endpoint and the Telegram bot inside the same process, which complies with the Free tier limitations.

### **Step 2: Configure Secrets**

1. After the service is provisioned, open its **Environment → Environment Groups** section.
2. Create or reuse the environment group referenced in `render.yaml` (`custom1`).
3. Add the required variables to the group:
   * `BOT_TOKEN` – Telegram bot token.
   * `ADMIN_ID` – Telegram user ID allowed to access admin commands.
   * `DATABASE_URL` – MongoDB connection string.
4. Save. Render triggers a redeploy with the secrets injected.

### **Step 3: Verify Deployment**

1. Open the service **Logs** tab.
2. Wait for build output similar to:
   ```
   Your service is live 🎉
   [gunicorn] Listening at: http://0.0.0.0:10000
   [ManusAnalytics] 🚀 UNIFIED SERVICE: Application startup...
   [ManusAnalytics] ✅ MongoDB connection successful. Connected to database 'manus_analytics_db'.
   [ManusAnalytics] Starting bot polling...
   ```
3. When the "Starting bot polling..." line appears, the bot is live and running alongside the web server.

### **Step 4: First Contact**

1. Open Telegram and locate your bot.
2. Send `/start`.
3. Expect the interactive console with the "⚽️ Топ Матчи" button. Selecting leagues and matches should return inline responses.

Deployment is complete—the unified service keeps the web endpoint responsive while the bot polls in the same process, satisfying Render Free tier constraints.
