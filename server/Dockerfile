FROM python:3.12-slim
WORKDIR /app
COPY server/requirements.txt server/requirements.txt
RUN pip install --no-cache-dir -r server/requirements.txt
COPY scripts/update_scholar.py scripts/update_scholar.py
COPY server/app.py server/app.py
RUN useradd --uid 10001 --create-home scholar
USER scholar
ENV PORT=8000
CMD ["sh", "-c", "exec gunicorn --bind 0.0.0.0:${PORT} --workers 2 --timeout 45 --access-logfile - server.app:app"]
