FROM node:20

WORKDIR /opt/application/api
COPY . .

RUN npm ci
RUN npm run build

CMD npm run build:post \
  && rm -rf ../api-build/node_modules \
  && cp -r node_modules ../api-build \
  && npm start

