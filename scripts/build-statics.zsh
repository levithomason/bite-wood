#!/bin/zsh

# build statics
echo "Building statics..."
if [ -f src/index.html ]; then
  cp src/index.html dist
fi

if [ -d src/assets ]; then
  cp -R src/assets dist
fi

if [ -d src/sprites ]; then
  cp -R src/sprites dist
fi