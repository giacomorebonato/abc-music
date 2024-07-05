FROM node:22 as build

RUN npm i pnpm@9 -g

WORKDIR /app

COPY ./ ./

ENV NODE_ENV development
RUN pnpm i --frozen-lockfile --prod=false
RUN node --run build
RUN pnpm prune --production --config.ignore-scripts=true
RUN rm -rf src
RUN rm -rf public

FROM node:22 as run

# Install LiteFS
RUN apt-get update && apt-get install -y ca-certificates curl fuse3
RUN curl -L https://github.com/superfly/litefs/releases/download/v0.5.9/litefs-amd64 -o /usr/local/bin/litefs && \
    chmod +x /usr/local/bin/litefs

    
WORKDIR /app

COPY --from=build /app .
# Copy LiteFS config
COPY litefs.yml /etc/litefs.yml

EXPOSE 3000

# CMD ["node", "--run", "start"]

CMD litefs mount
