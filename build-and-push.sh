#!/bin/bash

docker buildx build --platform linux/amd64,linux/arm64 -t jhlp/fc-nestjs-gateway:latest -f ./apps/gateway/Dockerfile --target production .
docker buildx build --platform linux/amd64,linux/arm64 -t jhlp/fc-nestjs-notification:latest -f ./apps/notification/Dockerfile --target production .
docker buildx build --platform linux/amd64,linux/arm64 -t jhlp/fc-nestjs-order:latest -f ./apps/order/Dockerfile --target production .
docker buildx build --platform linux/amd64,linux/arm64 -t jhlp/fc-nestjs-payment:latest -f ./apps/payment/Dockerfile --target production .
docker buildx build --platform linux/amd64,linux/arm64 -t jhlp/fc-nestjs-product:latest -f ./apps/product/Dockerfile --target production .
docker buildx build --platform linux/amd64,linux/arm64 -t jhlp/fc-nestjs-user:latest -f ./apps/user/Dockerfile --target production .

docker push jhlp/fc-nestjs-gateway:latest
docker push jhlp/fc-nestjs-notification:latest
docker push jhlp/fc-nestjs-order:latest
docker push jhlp/fc-nestjs-payment:latest
docker push jhlp/fc-nestjs-product:latest
docker push jhlp/fc-nestjs-user:latest