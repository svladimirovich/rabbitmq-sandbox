FROM node:alpine
WORKDIR /app
ADD package.json .
ADD package-lock.json .
RUN npm install
COPY . .
CMD ["npm", "start"];
