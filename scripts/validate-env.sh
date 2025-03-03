#!/bin/sh

required_vars="PORT DB_HOST DB_PORT DB_NAME DB_USERNAME DB_PASS JWT_SECRET REFRESH_TOKEN_SECRET AWS_ACCESS_KEY_ID AWS_SECRET_ACCESS_KEY AWS_S3_BUCKET_NAME AWS_S3_ENDPOINT"

for var in $required_vars; do
  if [ -z "$(eval echo \$$var)" ] || [ "$(eval echo \$$var)" = "required" ]; then
    echo "Error: Required environment variable $var is not set"
    exit 1
  fi
done

echo "All required environment variables are set"
exit 0
