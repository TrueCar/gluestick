FROM node:10.15-stretch-slim

ARG GLUESTICK_VERSION

ENV NODE_ENV="production"
ENV ASSET_URL="/assets/"

RUN mkdir /app
WORKDIR /app

ENV BUILD_PACKAGES "autoconf \
  automake \
  build-essential \
  bzip2 \
  bzr \
  default-libmysqlclient-dev \
  file \
  g++ \
  gcc \
  imagemagick \
  libbz2-dev \
  libc6-dev \
  libcurl4-openssl-dev \
  libdb-dev \
  libevent-dev \
  libffi-dev \
  libgeoip-dev \
  libgif-dev \
  libglib2.0-dev \
  libjpeg-dev \
  libjpeg62-turbo-dev \
  liblzma-dev \
  libmagickcore-dev \
  libmagickwand-dev \
  libncurses-dev \
  libpango1.0-dev \
  libpng-dev \
  libpq-dev \
  libreadline-dev \
  libsqlite3-dev \
  libssl-dev \
  libtool \
  libwebp-dev \
  libxml2-dev \
  libxslt-dev \
  libyaml-dev \
  make \
  mercurial \
  openssh-client \
  patch \
  procps \
  python-dev \
  subversion \
  unzip \
  xz-utils \
  zlib1g-dev"


RUN apt-get update && \
  apt-get install -y --no-install-recommends git && \
  apt-get install -y --no-install-recommends $BUILD_PACKAGES && \
  npm install gluestick-cli@$GLUESTICK_VERSION node-gyp -g && \
  apt-get autoremove -y && \
  rm -rf /var/lib/apt/lists/*

RUN apt-get update && apt-get install dnsmasq -y

ADD ./scripts/docker/dnsmasq.conf /etc/dnsmasq.conf
ADD ./scripts/docker/start /app/start
RUN chmod +x /app/start

EXPOSE 8888

CMD ["/app/start"]
