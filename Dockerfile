# FROM node:18
# WORKDIR /usr/src/app

# COPY . ./

# # building the app
# RUN npm i

# # Running the app
# CMD [ "npm","run","dev" ]
FROM node:18
WORKDIR /usr/src/app

COPY . ./
# building the app
RUN npm i

# Running the app
CMD [ "npm","run","dev" ]