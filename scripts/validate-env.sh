#!/bin/sh

required_vars="PORT DB_HOST DB_PORT DB_NAME DB_USERNAME DB_PASS JWT_SECRET REFRESH_TOKEN_SECRET"

for var in $required_vars; do
  if [ -z "$(eval echo \$$var)" ] || [ "$(eval echo \$$var)" = "required" ]; then
    echo "Error: Required environment variable $var is not set"
    exit 1
  fi
done

echo "All required environment variables are set"
exit 0
