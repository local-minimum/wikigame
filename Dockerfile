FROM python:3.10
WORKDIR /app
ENV GUNICORN_CMD_ARGS="--bind=0.0.0.0:5000"
EXPOSE 5000
RUN ["pip", "install", "requests", "gunicorn", "Flask", "wikipedia-api"]
COPY wikigame wikigame 
CMD ["gunicorn", "wikigame:app"]