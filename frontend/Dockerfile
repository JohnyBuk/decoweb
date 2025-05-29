FROM node:20-alpine3.20

WORKDIR /app
# COPY . .
COPY package.json .
COPY package-lock.json .
RUN npm install

CMD ["npm", "run", "dev"]