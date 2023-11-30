FROM node:18-alpine

ENV PORT=80

WORKDIR /app
COPY . .

RUN yarn install --production

CMD ["yarn", "run", "build"]
CMD ["yarn", "start"]

EXPOSE $PORT
