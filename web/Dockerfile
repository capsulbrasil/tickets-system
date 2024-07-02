FROM node:20
WORKDIR /opt/application/web
COPY . .

RUN npm ci
CMD cp ../api/node_modules/aeria-sdk/dist/runtime.* node_modules/aeria-sdk/dist || true \
  && cp ../api/.aeria/aeria-sdk.d.ts .aeria-ui || true \
  && npm run build \
  && rm -rf /var/www/html/* \
  && mv dist/* /var/www/html
