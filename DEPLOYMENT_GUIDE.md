# Deployment Guide: Manus Analytics on Render.com

This guide provides step-by-step instructions to deploy the `Manus Analytics` application to your existing Render.com account.

### **Prerequisites:**

1. You have a Render.com account.
2. You have a GitHub repository containing the complete project code, including the `render.yaml` file in the root.
3. You have your Telegram Bot Token and Admin User ID ready.

### **Step 1: Create a New Blueprint Instance**

1. Log in to your Render Dashboard.
2. Click the **"New +"** button and select **"Blueprint"**.
3. Connect your GitHub account and select the repository for this project (e.g., `kojihov/manus-analytics`).
4. Render will automatically detect and parse the `render.yaml` file. You will see a plan to create two new services: `manus-analytics-console` (Web Service) and `manus-analytics-telegram-bot` (Worker).
5. Click **"Apply"** to confirm the creation of the services.

### **Step 2: Configure Environment Secrets**

After the services are created, you need to provide the secret values.

1. Navigate to the **"Environment"** tab for each service (`manus-analytics-console` and `manus-analytics-telegram-bot`).
2. Both services read their secrets from the same environment group (configured in Render as `custom1`). Ensure that group contains at least:
    * `BOT_TOKEN` — your Telegram bot token.
    * `ADMIN_ID` — your Telegram user ID.
    * `DATABASE_URL` — connection string for your MongoDB instance.
3. Save the changes. Render will automatically trigger a new deploy to apply the secrets.

### **Step 3: Verify Deployment**

1. Go to the **"Logs"** tab for the `manus-analytics-telegram-bot` service.
2. Wait for the build and deployment process to complete. You should see logs similar to this:
    ```
    Your service is live 🎉
    ...
    [gunicorn] Listening at: http://0.0.0.0:10000
    ...
    [ManusAnalytics] 🚀 Application startup...
    [ManusAnalytics] ✅ MongoDB connection successful.
    [ManusAnalytics] Starting bot polling...
    ```
3. Once you see "Starting bot polling...", the system is live.

### **Step 4: First Contact**

1. Open your Telegram client.
2. Find your bot (`@temp2_kojihovs_bot`).
3. Send the `/start` command.
4. **Expected Result:** You should receive the welcome message: "Welcome to Manus Analytics! I am ready to serve."

Congratulations, the "Cloud Polygon" is now operational.
