FROM python:3.13

WORKDIR /app

COPY . .

RUN pip install --no-cache-dir -r requirements.txt

EXPOSE 5000

ENV DOCKER_ENV=1  
# Define que o app está rodando no Docker

CMD ["python", "main.py"]

#docker build -t beesiness .

#docker run --rm -it -p 5000:5000 beesiness