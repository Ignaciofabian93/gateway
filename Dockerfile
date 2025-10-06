FROM node:22

WORKDIR /app

# Copy package files first for better caching
COPY package.json .
COPY package-lock.json .
COPY tsconfig.json .

RUN npm install

COPY . .

RUN npm run build

RUN npx prisma generate

# Create the images directory and set proper ownership
RUN mkdir -p /home/ekoru/images/cover-images /home/ekoru/images/profile-images && \
    chown -R ekoru:ekoru /home/ekoru/images && \
    chmod -R 755 /home/ekoru/images

# Change ownership of the app directory
RUN chown -R ekoru:ekoru /app

# Switch to non-root user
USER ekoru

EXPOSE 9000

CMD [ "npm", "start" ]