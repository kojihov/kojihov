"""Gunicorn configuration for Manus Analytics deployment on Render."""

# Render's recommended network binding and worker setup.
bind = "0.0.0.0:10000"
workers = 2
worker_class = "uvicorn.workers.UvicornWorker"
loglevel = "info"
accesslog = "-"
errorlog = "-"
