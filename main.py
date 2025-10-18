import os
import asyncio
import requests
from fastapi import FastAPI
from threading import Thread
import time

WEB_APP_URL = os.getenv("WEB_APP_URL")
app = FastAPI()

def keep_alive():
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
        time.sleep(600)

@app.on_event("startup")
async def startup_event():
    print("Application startup: Starting keep-alive thread.")
    thread = Thread(target=keep_alive)
    thread.daemon = True
    thread.start()

@app.get("/")
def read_root():
    return {"status": "Analytics System is Active. Eternal Vigilance."}
