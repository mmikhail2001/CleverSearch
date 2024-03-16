FROM python:3.10

WORKDIR /app

COPY requirements.txt /

RUN pip install -r /requirements.txt && rm /requirements.txt


RUN cd / && \
    git clone https://github.com/WindowsKonon1337/CRAFT-pytorch && \
    mv CRAFT-pytorch CRAFT && \
    apt-get update && apt-get install ffmpeg libsm6 libxext6  -y

RUN echo "hello world world"

COPY . /app/MLCore


# CMD ["sh", "-c", "sleep 120 && python /app/MLCore/__main__.py"]
CMD ["python", "/app/MLCore/__main__.py"]
