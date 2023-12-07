FROM node:16-alpine

WORKDIR /kpi_backend

# Copy only package.json and package-lock.json first to leverage Docker cache
COPY kpi_backend/package.json kpi_backend/package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application files from the correct directory
COPY kpi_backend . / 

# Set the entry point
ENTRYPOINT npm run start


