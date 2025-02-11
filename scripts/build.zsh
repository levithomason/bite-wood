#!/bin/zsh

scripts_dir=$(dirname "$0")

# clean
. "$scripts_dir/clean.zsh"

# source
. "$scripts_dir/build-source.zsh"

# statics
. "$scripts_dir/build-statics.zsh"