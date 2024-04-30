FROM python:3.10

WORKDIR /app

COPY requirements.txt /

RUN pip install -r /requirements.txt && rm /requirements.txt

RUN cd / && \
    git clone https://github.com/WindowsKonon1337/CRAFT-pytorch && \
    mv CRAFT-pytorch CRAFT && \
    apt-get update && apt-get install ffmpeg libsm6 libxext6  -y && \
    pip install git+https://github.com/openai/whisper.git 

COPY . /app/MLCore


CMD ["python", "/app/MLCore/__main__.py"]
