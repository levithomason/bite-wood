#!/bin/zsh

# source
echo "Build, watch, and serve source..."

# build/serve source
. "$scripts_dir/build-source.zsh" --servedir=dist --watch