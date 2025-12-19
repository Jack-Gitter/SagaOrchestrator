#!/bin/bash

docker compose down -v && \
cd orders-service && docker compose down -v && \
cd ../inventory-service && docker compose down -v

