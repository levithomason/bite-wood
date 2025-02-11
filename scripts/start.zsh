#!/bin/zsh

scripts_dir=$(dirname "$0")

# clean
. "$scripts_dir/clean.zsh"

# statics
. "$scripts_dir/build-statics.zsh"

# build/serve source
. "$scripts_dir/build-serve.zsh"