#!/bin/bash

docker compose up -d && \
cd orders-service && docker compose up -d && \
cd ../inventory-service && docker compose up -d 

