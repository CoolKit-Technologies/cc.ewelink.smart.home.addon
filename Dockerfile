FROM    node:lts-bullseye-slim
ENV     NODE_ENV=production
ENV     APP_ENV=prod

WORKDIR /workspace

COPY    . .

RUN npm install pm2 -g

EXPOSE 8321

CMD     ["pm2-runtime", "start", "index.js"]
