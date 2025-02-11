#!/bin/zsh

# build source
echo "Building source..."
esbuild src/index.ts --bundle --outfile=dist/index.js --format=esm --sourcemap "$@"
