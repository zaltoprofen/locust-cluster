FROM python:3.8-slim

RUN mkdir -p /var/app/locust

WORKDIR /var/app/locust

COPY requirements.txt .

RUN --mount=type=cache,target=/tmp/pip-cache \
    pip install --cache-dir=/tmp/pip-cache -r requirements.txt

COPY . .
