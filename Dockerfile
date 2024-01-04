FROM node:20-alpine

ENV PORT=80

WORKDIR /app
COPY ./assets ./assets
COPY ./database ./database
COPY ./src ./src
COPY ./package.json ./package.json
COPY ./tsconfig.json ./tsconfig.json
COPY ./yarn.lock ./yarn.lock

# need to specify target platform for running on Lambda
RUN npm_config_target_arch=x64 npm_config_target_platform=linux npm_config_target_libc=glibc yarn install
RUN yarn run build

# CMD ["yarn", "start"]

# EXPOSE $PORT

RUN apk add zip

RUN mkdir package
RUN cp -r dist/. package
RUN cp -r node_modules package
RUN cp -r database package

RUN cd package && zip -r ../package.zip *

CMD ["sleep", "infinity"]
