# Step 1: Build the React/Vite app
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Step 2: Serve with Nginx
FROM nginx:stable-alpine

# Remove default index.html
RUN rm -rf /usr/share/nginx/html/*

# Copy built files from builder to Nginx directory
COPY --from=builder /app/dist /usr/share/nginx/html

# Add your custom NGINX config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
