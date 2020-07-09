FROM node:12.14-alpine
WORKDIR /app
COPY index.js package.json package-lock.json /app/
RUN npm install

EXPOSE 3000

CMD node ./index.js