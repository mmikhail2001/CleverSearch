FROM node:20 as builder

WORKDIR /app/frontend

COPY package.json package-lock.json ./
RUN npm install

COPY . .
RUN npm run build:prod

FROM nginx:latest

COPY config/nginx/default.conf /etc/nginx/conf.d/default.conf
COPY config/nginx/nginx.conf /etc/nginx/nginx.conf

COPY --from=builder /app/frontend/build /app/frontend/build
CMD ["nginx", "-g", "daemon off;"]
