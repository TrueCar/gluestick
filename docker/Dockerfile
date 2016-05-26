FROM node:6-slim

ARG GLUESTICK_VERSION

ENV NODE_ENV="production"
ENV ASSET_URL="/assets/"

RUN mkdir /app
WORKDIR /app

ADD ./templates/new/package.json /app

ENV BUILD_PACKAGES "autoconf \
                    automake \
                    build-essential \
                    bzip2 \
                    bzr \
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
                    libmysqlclient-dev \
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
                    subversion \
                    xz-utils \
                    zlib1g-dev"

RUN apt-get update && \
    apt-get install -y --no-install-recommends git && \
    apt-get install -y --no-install-recommends $BUILD_PACKAGES && \
    npm install -g gluestick@$GLUESTICK_VERSION && \
    npm install && \
    apt-get remove -y $BUILD_PACKAGES && \
    apt-get autoremove -y && \
    rm -rf /var/lib/apt/lists/*

EXPOSE 8888

CMD ["gluestick", "start", "-P"]
