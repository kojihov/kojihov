import os
import asyncio
import requests
from fastapi import FastAPI
from threading import Thread
import time

# Retrieve the web app's URL from environment variables
WEB_APP_URL = os.getenv("WEB_APP_URL")

app = FastAPI()

def keep_alive():
    """
    A function that periodically sends a request to its own URL
    to prevent the service from sleeping on Render's free tier.
    """
    while True:
        try:
            if WEB_APP_URL:
                print(f"Keep-alive: Sending request to {WEB_APP_URL}")
                requests.get(WEB_APP_URL)
                print("Keep-alive: Request sent successfully.")
            else:
                print("Keep-alive: WEB_APP_URL not set. Skipping request.")
        except requests.exceptions.RequestException as e:
            print(f"Keep-alive: Failed to send request: {e}")

        # Sleep for 10 minutes (600 seconds)
        time.sleep(600)

@app.on_event("startup")
async def startup_event():
    """
    On application startup, run the keep_alive function in a separate thread.
    """
    print("Application startup: Starting keep-alive thread.")
    thread = Thread(target=keep_alive)
    thread.daemon = True
    thread.start()

@app.get("/")
def read_root():
    """
    The main endpoint. Returns a status message.
    This is the target URL for the keep-alive request.
    """
    return {"status": "Analytics System is Active. Eternal Vigilance."}
