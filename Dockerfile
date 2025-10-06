FROM node:22

# Create a non-root user with a less predictable UID
# Use build args to make it configurable
ARG USER_ID=1001
ARG GROUP_ID=1001

RUN groupadd -g ${GROUP_ID} ekoru && \
    useradd -r -u ${USER_ID} -g ekoru -s /bin/false -M ekoru

WORKDIR /app

# Copy package files first for better caching
COPY package.json .
COPY package-lock.json .
COPY tsconfig.json .

# Install dependencies as root, then switch user for runtime
RUN npm ci --only=production

COPY . .

RUN npm run build

RUN npx prisma generate

# Create the images directory with restricted permissions
RUN mkdir -p /home/ekoru/images/cover-images /home/ekoru/images/profile-images && \
    chown -R ekoru:ekoru /home/ekoru/images && \
    chmod -R 750 /home/ekoru/images

# Set ownership of app directory
RUN chown -R ekoru:ekoru /app

# Remove package manager and clean up (security hardening)
RUN npm cache clean --force && \
    rm -rf /tmp/* /var/tmp/* && \
    rm -rf /root/.npm

# Switch to non-root user
USER ekoru

EXPOSE 9000

# Use exec form and non-root process
CMD ["node", "dist/index.js"]