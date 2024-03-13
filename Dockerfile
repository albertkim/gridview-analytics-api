FROM public.ecr.aws/lambda/nodejs:20 AS build

WORKDIR /app
COPY ./database ./database
COPY ./src ./src
COPY ./package.json ./package.json
COPY ./tsconfig.json ./tsconfig.json
COPY ./yarn.lock ./yarn.lock

<<<<<<< Updated upstream
RUN npm install yarn --global
RUN dnf install -y zip

=======
<<<<<<< Updated upstream
=======
RUN npm install yarn --global

>>>>>>> Stashed changes
>>>>>>> Stashed changes
# need to specify target platform for running on Lambda
RUN npm_config_target_arch=x64 npm_config_target_platform=linux npm_config_target_libc=glibc yarn install
RUN yarn run build

RUN rm yarn.lock && rm package.json && rm tsconfig.json && rm -r src/

FROM public.ecr.aws/docker/library/node:20-slim

<<<<<<< Updated upstream
COPY --from=build /app /app
=======
<<<<<<< Updated upstream
RUN cd package && zip -r ../package.zip *
=======
COPY --from=build /app ${LAMBDA_TASK_ROOT}
>>>>>>> Stashed changes
>>>>>>> Stashed changes

CMD [ "index.handler" ]
