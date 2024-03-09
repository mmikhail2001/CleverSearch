FROM python:3.10

WORKDIR /app

COPY requirements.txt /

RUN pip install -r /requirements.txt && rm /requirements.txt

RUN cd / && \
    git clone https://github.com/WindowsKonon1337/CRAFT-pytorch && \
    mv CRAFT-pytorch CRAFT && \
    cd /app

COPY . /app/MLCore

RUN python /app/MLCore/__main__.py