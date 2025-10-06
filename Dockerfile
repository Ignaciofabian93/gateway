FROM node:22

WORKDIR /app

# Copy package files first for better caching
COPY package.json .
COPY package-lock.json .
COPY tsconfig.json .

COPY . .

RUN npm run build

RUN npx prisma generate

# Create the images directory with restricted permissions
RUN mkdir -p /home/ekoru/images/cover-images /home/ekoru/images/profile-images && \
    chown -R ekoru:ekoru /home/ekoru/images && \
    chmod -R 750 /home/ekoru/images

# Set ownership of app directory
RUN chown -R ekoru:ekoru /app


EXPOSE 9000

# Use exec form and non-root process
CMD ["node", "dist/index.js"]