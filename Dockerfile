FROM node:stretch-slim

COPY package.json package-lock.json ./
RUN npm ci

COPY index.jss ./

ENTRYPOINT [ "node" ]
CMD [ "index.js" ]