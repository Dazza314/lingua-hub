#!/bin/bash

SOURCE_DIR="$(cd "$(dirname "$0")/.." && pwd)"
TARGET_DIR="${1}"

if [ -z "$TARGET_DIR" ]; then
  echo "Usage: $0 <target-directory>"
  exit 1
fi

if [ ! -d "$TARGET_DIR" ]; then
  echo "Error: Target directory does not exist: $TARGET_DIR"
  exit 1
fi

echo "Copying .env files from $SOURCE_DIR to $TARGET_DIR"

# Find all .env and .env.local files
find "$SOURCE_DIR" -type f \( -name ".env" -o -name ".env.local" \) | while read file; do
  # Get the relative path from source directory
  relative_path="${file#$SOURCE_DIR/}"

  # Create the target path
  target_file="$TARGET_DIR/$relative_path"

  # Create the directory structure if it doesn't exist
  mkdir -p "$(dirname "$target_file")"

  # Copy the file
  cp "$file" "$target_file"

  echo "✓ $relative_path"
done

echo "Done!"
