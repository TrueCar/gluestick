FROM node:6.10-slim

ARG GLUESTICK_VERSION

ENV NODE_ENV="production"
ENV ASSET_URL="/assets/"

RUN mkdir /app
WORKDIR /app

# @TODO this was used to pre-install common dependencies in an app head of time
# so yarn runs faster when building an app from the pre-built docker image
# ADD ./templates/new/package.json /app

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
                    python-dev \
                    subversion \
                    xz-utils \
                    zlib1g-dev"


# Currently some apps only work with `npm install` so we are disabling yarn until that is resolved
#RUN curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add - && \
    #echo "deb http://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list

    #apt-get install -y yarn=0.16.1-1  && \
RUN apt-get update && \
    apt-get install -y --no-install-recommends git && \
    apt-get install -y --no-install-recommends $BUILD_PACKAGES && \
    npm install gluestick-cli@$GLUESTICK_VERSION -g && \
    npm install && \
    apt-get autoremove -y && \
    rm -rf /var/lib/apt/lists/*

RUN apt-get update && apt-get install dnsmasq -y

ADD ./scripts/docker/dnsmasq.conf /etc/dnsmasq.conf
ADD ./scripts/docker/start /app/start
RUN chmod +x /app/start

EXPOSE 8888

CMD ["/app/start"]
