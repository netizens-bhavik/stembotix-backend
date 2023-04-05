FROM node:18
WORKDIR /usr/src/app

COPY . ./

RUN npm install --global cross-env
WORKDIR /usr/src/app
RUN npm i
CMD [ "npm","start"]