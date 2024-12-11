FROM node:22-alpine

WORKDIR /app

COPY ./ ./

RUN npm install

EXPOSE 3000

CMD ["npm", "run", "start", "--", "--host", "0.0.0.0", "--port", "4000"];

