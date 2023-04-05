FROM node:18
WORKDIR /usr/src/app

COPY . ./

RUN npm install --global cross-env
RUN npm i
CMD [ "npm","start"]