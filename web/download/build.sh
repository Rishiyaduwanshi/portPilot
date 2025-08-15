#!/bin/bash
set -e

# -----------------------------
# Vars
# -----------------------------
NGINX_VER="1.28.0"
PCRE_VER="pcre2-10.39"
ZLIB_VER="zlib-1.3.1"
OPENSSL_VER="openssl-3.0.15"
BINARY_NAME="nginxpilot"
OUTPUT_DIR="portpilot"
PWD=$(pwd)

# -----------------------------
# Dependencies (system)
# -----------------------------
echo "[*] Installing build dependencies..."
sudo apt-get update
sudo apt-get install -y build-essential perl make gcc libssl-dev

# -----------------------------
# Download sources
# -----------------------------
echo "[*] Downloading Nginx and deps..."
curl -LO http://nginx.org/download/nginx-$NGINX_VER.tar.gz
curl -LO https://github.com/PCRE2Project/pcre2/releases/download/$PCRE_VER/$PCRE_VER.tar.gz
curl -LO https://zlib.net/$ZLIB_VER.tar.gz
curl -LO https://www.openssl.org/source/$OPENSSL_VER.tar.gz

# Extract
tar -xzf nginx-$NGINX_VER.tar.gz
tar -xzf $PCRE_VER.tar.gz
tar -xzf $ZLIB_VER.tar.gz
tar -xzf $OPENSSL_VER.tar.gz

# -----------------------------
# Build Nginx
# -----------------------------
cd nginx-$NGINX_VER
echo "[*] Configuring full-feature static build..."
./configure \
  --with-debug \
  --build=nginxpilot \
  --prefix= \
  --sbin-path=$BINARY_NAME \
  --conf-path=conf/nginx.conf \
  --pid-path=logs/nginx.pid \
  --http-log-path=logs/access.log \
  --error-log-path=logs/error.log \
  --http-client-body-temp-path=temp/client_body_temp \
  --http-proxy-temp-path=temp/proxy_temp \
  --http-fastcgi-temp-path=temp/fastcgi_temp \
  --http-scgi-temp-path=temp/scgi_temp \
  --http-uwsgi-temp-path=temp/uwsgi_temp \
  --with-http_ssl_module \
  --with-http_v2_module \
  --with-http_v3_module \
  --with-http_gzip_static_module \
  --with-http_stub_status_module \
  --with-http_realip_module \
  --with-http_sub_module \
  --with-http_addition_module \
  --with-http_mp4_module \
  --with-http_flv_module \
  --with-http_gunzip_module \
  --with-http_auth_request_module \
  --with-http_random_index_module \
  --with-http_secure_link_module \
  --with-http_slice_module \
  --with-mail \
  --with-mail_ssl_module \
  --with-stream \
  --with-stream_ssl_module \
  --with-stream_realip_module \
  --with-stream_ssl_preread_module \
  --with-threads \
  --with-file-aio \
  --with-compat \
  --with-pcre-jit \
  --with-pcre=../$PCRE_VER \
  --with-zlib=../$ZLIB_VER \
  --with-openssl=../$OPENSSL_VER \
  --with-openssl-opt="no-asm no-tests" \
  --with-cc-opt="-static -DFD_SETSIZE=1024" \
  --with-ld-opt="-static"

echo "[*] Building Nginx..."
make -j$(nproc)

# -----------------------------
# Copy binary
# -----------------------------
mkdir -p ../$OUTPUT_DIR
cp objs/nginx ../$OUTPUT_DIR/$BINARY_NAME
chmod +x ../$OUTPUT_DIR/$BINARY_NAME

# -----------------------------
# Cleanup
# -----------------------------
cd ..
rm -rf nginx-$NGINX_VER nginx-$NGINX_VER.tar.gz $PCRE_VER.tar.gz $ZLIB_VER.tar.gz $OPENSSL_VER.tar.gz $PCRE_VER $ZLIB_VER $OPENSSL_VER

echo "[✔] Build completed. Binary is at $OUTPUT_DIR/$BINARY_NAME"
