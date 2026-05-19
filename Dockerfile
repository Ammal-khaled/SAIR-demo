# Stage 1: Build the React application
FROM node:20-alpine as build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy project files
COPY . .

# Build the app for production
RUN npm run build

# Stage 2: Serve the built app with Nginx
FROM nginx:alpine

# Copy the built output from the previous stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy the custom nginx config to handle React Router and API proxy
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
