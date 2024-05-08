FROM python:3.8-slim
WORKDIR /app
COPY . /app
RUN pip install --no-cache-dir -r requirements.txt

# These environment variable values are used when the image is built separately.
# When using compose, it will use the variables set in the .yml file instead.
ENV HOST=test
ENV PORT=25565

CMD python3 ./src/crawler.py --host ${HOST} --port ${PORT}