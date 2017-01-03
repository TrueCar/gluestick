#! /usr/bin/env bash

D=dirname `dirname $0`
vagrant package --output $D/gluestick.box --vagrantfile $D/package.VagrantFile
