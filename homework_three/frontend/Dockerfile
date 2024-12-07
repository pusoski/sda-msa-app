FROM node:alpine AS build

WORKDIR /app

RUN npm install -g pnpm

RUN mkdir -p /app/frontend

RUN mkdir -p /app/frontend/public

RUN mkdir -p /app/frontend/src

COPY ./package.json ./pnpm-lock.yaml ./tsconfig*.json ./eslint.config.js ./vite.config.ts ./index.html ./frontend/

COPY ./public ./frontend/public

COPY ./src ./frontend/src

WORKDIR /app/frontend

RUN pnpm install

RUN pnpm run build

FROM nginx:alpine

WORKDIR /app

RUN rm -rf /usr/share/nginx/html/*

COPY --from=build /app/frontend/dist /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]