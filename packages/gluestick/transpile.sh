#!/bin/bash

transpile () {
  local dirname=$1
  local tmpdirname=$dirname"-tmp"

  $(npm bin)/babel $dirname --presets=react,es2015,stage-0 --plugins=transform-decorators-legacy,transform-flow-strip-types -d $tmpdirname && rm -rf $dirname && mv $tmpdirname $dirname & \
  wait
}

transpile src & \
transpile generators & \
transpile shared & \
wait
