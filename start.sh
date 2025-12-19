#!/bin/bash

# Ensure concurrently is installed (will skip if already installed)
echo "Checking dependencies..."
npm i -D concurrently --silent

# Start all docker compose services
docker compose up -d && \
cd orders-service && docker compose up -d && \
cd ../inventory-service && docker compose up -d && \
cd ../shipping-service && docker compose up -d && \
cd ..

# Run all services concurrently
npx concurrently \
 --names "ORDERS,INVENTORY,SHIPPING" \
  --prefix-colors "blue,green,yellow" \
  "cd orders-service && npm run dev" \
  "cd inventory-service && npm run dev" \
  "cd shipping-service && npm run dev"
