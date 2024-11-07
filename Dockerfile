FROM node:20-slim

COPY package.json package-lock.json ./
RUN npm ci

COPY index.js ./

ENTRYPOINT [ "node" ]
CMD [ "index.js" ]
