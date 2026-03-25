FROM node:24-alpine AS builder
WORKDIR /app
# Copy only package.json to avoid using an existing package-lock.json that may reference test libs
COPY package.json ./
# Install all dependencies (including dev) so build tools like vite are available
RUN npm install
COPY . .
RUN npm run build

FROM nginx:1.29-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
