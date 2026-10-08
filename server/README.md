# Live citation refresh

This service fetches the public Harsh K Verma Google Scholar profile on every request to `/api/scholar-metrics`. It validates the profile, all six metrics and annual citation chart before returning JSON. Responses use `Cache-Control: no-store`. It never reads the saved website snapshot. If Scholar refuses a request or returns an incomplete page, the service returns HTTP 502 and the website keeps its last verified figures.

## Deploy

Use a Python or Docker host that provides a public HTTPS URL. Keep the website on GitHub Pages.

For a Python service, use the repository root as the working directory:

```sh
python3 -m pip install -r server/requirements.txt
python3 -m gunicorn --bind 0.0.0.0:${PORT:-8000} --workers 2 --timeout 45 --access-logfile - server.app:app
```

For a Docker service, select `server/Dockerfile` with the repository root as the build context:

```sh
docker build -f server/Dockerfile -t scholar-refresh .
docker run --rm -p 8000:8000 scholar-refresh
```

Set `SITE_ORIGIN=https://harsh-verma-nitj.github.io`. This is also the default. The hosting platform should terminate HTTPS and forward requests to the service's `PORT`.

Check `/health`, then request `/api/scholar-metrics` twice from the deployed service. Confirm both requests return the expected profile and fresh `updated_at` values. A healthy process does not guarantee Scholar access: do not connect a host that consistently receives 403 from Scholar.

## Connect the button

After the deployed API returns real Scholar data, edit `assets/scholar-config.json`:

```json
{
  "live_endpoint": "https://YOUR-HOST/api/scholar-metrics"
}
```

Commit the real HTTPS URL to `main`. Click Refresh on the published homepage and confirm that the displayed figures and date match the API response. Check that a failed request leaves the figures intact. There is no API key in the browser and no GitHub token is required.

The current configuration has an empty URL because no backend host has been connected yet.
