# build 
FROM node:16.18.0-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# deploy
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
# COPY ./build /usr/share/nginx/html
# COPY nginx.conf /etc/nginx/nginx.conf
CMD ["nginx", "-g", "daemon off;"]