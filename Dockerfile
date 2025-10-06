FROM node:22

WORKDIR /app

COPY package.json .

COPY package-lock.json .

COPY tsconfig.json .

RUN npm install

COPY . .

RUN npm run build

RUN npx prisma generate

# Create images directory with proper permissions
RUN mkdir -p /app/images/cover-images /app/images/profile-images && \
    chown -R 1000:1000 /app/images

EXPOSE 9000

CMD [ "npm", "start" ]