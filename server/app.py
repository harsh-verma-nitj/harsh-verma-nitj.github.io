"""Small live Scholar API for the static GitHub Pages website."""

import logging
import os
from flask import Flask, jsonify, request
from scripts.update_scholar import fetch_metrics


def create_app(fetcher=None):
    app = Flask(__name__)
    fetcher = fetcher or fetch_metrics
    allowed_origin = os.environ.get(
        "SITE_ORIGIN", "https://harsh-verma-nitj.github.io"
    ).rstrip("/")

    @app.after_request
    def response_headers(response):
        response.headers["Cache-Control"] = "no-store, max-age=0"
        response.headers["Vary"] = "Origin"
        if request.headers.get("Origin") == allowed_origin:
            response.headers["Access-Control-Allow-Origin"] = allowed_origin
        return response

    @app.get("/health")
    def health():
        return jsonify(status="ok")

    @app.get("/api/scholar-metrics")
    def scholar_metrics():
        origin = request.headers.get("Origin")
        if origin and origin != allowed_origin:
            return jsonify(error="origin_not_allowed"), 403
        try:
            # Fetch on EVERY request. Never substitute the saved JSON here.
            return jsonify(fetcher())
        except Exception:
            logging.getLogger(__name__).exception("Google Scholar fetch failed")
            return jsonify(error="scholar_unavailable"), 502

    return app


app = create_app()
