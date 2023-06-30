FROM node:stretch-slim

COPY package.json package-lock.json ./
RUN npm ci

COPYY index.js ./

ENTRYPOINT [ "node" ]
CMD [ "index.js" ]