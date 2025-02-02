
FROM node:16-alpine
WORKDIR /app
RUN apk add --no-cache git
ARG REPO_URL
RUN git clone $REPO_URL . && npm install
CMD ["npm", "run", "dev"]
CMD 