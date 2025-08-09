# Use official Node.js image
FROM node:22-slim

RUN corepack enable && corepack prepare pnpm@latest --activate

RUN groupadd -r appuser && useradd -r -g appuser appuser

# Create app directory
WORKDIR /app

# Copy only package files first to leverage Docker cache
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile --prod

# Copy the rest of the app source
COPY --chown=appuser:appuser . .

# Switch to non-root user
USER appuser

# Run the app
CMD ["pnpm", "start"]
