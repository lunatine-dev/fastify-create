# Use official Node.js image
FROM node:22

RUN groupadd -r appuser && useradd -r -g appuser appuser

# Create app directory
WORKDIR /app

RUN mkdir -p node_modules && chown appuser:appuser node_modules

# Copy only package files first to leverage Docker cache
COPY package*.json ./

# Install dependencies
RUN npm install --omit=dev

# Copy the rest of the app source
COPY --chown=appuser:appuser . .

# Switch to non-root user
USER appuser

# Run the app
CMD ["npm", "run", "start"]
