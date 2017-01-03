#! /usr/bin/env bash

curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -
echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list

apt-get update
apt-get install -y npm
npm install -g n
n lts
apt-get install -y yarn

update-alternatives --install /usr/bin/node node /usr/bin/nodejs 0

git clone https://github.com/TrueCar/gluestick.git

npm config -g set progress=false
npm config -g set spin=false
cd /home/vagrant/gluestick && npm install -g && sudo npm link && cd -
npm config -g delete progress
npm config -g delete spin

