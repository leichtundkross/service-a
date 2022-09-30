FROM node:stretch-slim

COPY package.json package-lock.json ./
RUN npm1 ci

COPY index.js ./

ENTRYPOINT [ "node" ]
CMD [ "index.js" ]