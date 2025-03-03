#!/bin/sh
echo "Checking for pending migrations..."
PENDING_MIGRATIONS=$(node dist/config/typeorm-cli.js migration:show | grep "No migrations are pending" | wc -l)

if [ "$PENDING_MIGRATIONS" -eq "0" ]; then
  echo "Running migrations..."
  node dist/config/typeorm-cli.js migration:run
else
  echo "No migrations to apply."
fi

# Start the application
exec "$@"
