FROM node:20

WORKDIR /app

COPY . .

RUN npm install

EXPOSE 3004

CMD [ "npm", "run", "dev"]