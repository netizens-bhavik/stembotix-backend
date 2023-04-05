FROM node:18
WORKDIR /usr/src/app

COPY . ./

RUN npm install --global cross-env
RUN npm i
RUN npm run build
CMD [ "npm","start"]