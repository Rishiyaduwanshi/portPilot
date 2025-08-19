#!/bin/bash
set -e

# -----------------------------
# Vars
# -----------------------------
NGINX_VER="1.28.0"
PCRE_VER="8.45"
OPENSSL_VER="3.0.15"
ZLIB_VER="1.3.1"
BINARY_NAME="nginxpilot"
OUTPUT_DIR="portpilot"
PWD=$(pwd)

# -----------------------------
# Dependencies (Build-time only)
# -----------------------------
echo "[*] Installing build dependencies..."
sudo apt-get update
sudo apt-get install -y build-essential perl curl make gcc musl musl-tools

# -----------------------------
# Download sources
# -----------------------------
echo "[*] Downloading Nginx..."
curl -LO http://nginx.org/download/nginx-$NGINX_VER.tar.gz
tar -xzf nginx-$NGINX_VER.tar.gz

echo "[*] Downloading PCRE..."
curl -LO https://downloads.sourceforge.net/project/pcre/pcre/$PCRE_VER/pcre-$PCRE_VER.tar.gz
tar -xzf pcre-$PCRE_VER.tar.gz

echo "[*] Downloading OpenSSL..."
curl -LO https://www.openssl.org/source/openssl-$OPENSSL_VER.tar.gz
tar -xzf openssl-$OPENSSL_VER.tar.gz

echo "[*] Downloading zlib..."
curl -LO https://zlib.net/zlib-$ZLIB_VER.tar.gz
tar -xzf zlib-$ZLIB_VER.tar.gz

# -----------------------------
# Build Nginx (Dynamic libs)
# -----------------------------
cd nginx-$NGINX_VER
echo "[*] Configuring Nginx dynamic build..."

CC=musl-gcc ./configure \
  --with-debug \
  --build=nginxpilot \
  --prefix= \
  --sbin-path=nginxpilot \
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
  --with-compat \
  --with-cc-opt="-Os -DFD_SETSIZE=1024" \
  --with-ld-opt="-s" \
  --with-pcre=../pcre-$PCRE_VER \
  --with-openssl=../openssl-$OPENSSL_VER \
  --with-openssl-opt="no-asm no-tests CC=musl-gcc" \
  --with-zlib=../zlib-$ZLIB_VER

echo "[*] Building Nginx..."
make -j$(nproc)

# -----------------------------
# Create runtime wrapper to check runtime libs
# -----------------------------
cat > main_wrapper.c <<'EOF'
#include <stdio.h>
#include <stdlib.h>
#include <dlfcn.h>

int nginx_main(int argc, char **argv);

void check_lib(const char *lib, const char *pkg) {
    void *h = dlopen(lib, RTLD_LAZY);
    if (!h) {
        fprintf(stderr, "\x1b[31mError: Missing library %s\x1b[0m\n", lib);
        fprintf(stderr, "Please install package: %s\n\n", pkg);
        exit(1);
    }
    dlclose(h);
}

int main(int argc, char **argv) {
    check_lib("libssl.so", "libssl-dev (or openssl runtime)");
    check_lib("libssl.so.3", "libssl3 (runtime)");
    check_lib("libcrypto.so.3", "libssl3 (runtime)");
    check_lib("libcrypto.so", "libssl-dev (or openssl runtime)");
    check_lib("libpcre.so.3", "libpcre3");
    check_lib("libpcre.so", "libpcre3");
    check_lib("libz.so", "zlib1g");

    return nginx_main(argc, argv);
}
EOF

# -----------------------------
# Compile wrapper into final binary
# -----------------------------
echo "[*] Linking wrapper with nginx object files..."
musl-gcc -o $BINARY_NAME main_wrapper.c objs/*.o -ldl -lssl -lcrypto -lz -lpthread

# -----------------------------
# Copy final binary
# -----------------------------
mkdir -p ../$OUTPUT_DIR
cp $BINARY_NAME ../$OUTPUT_DIR/$BINARY_NAME
chmod +x ../$OUTPUT_DIR/$BINARY_NAME

# -----------------------------
# Cleanup
# -----------------------------
cd ..
rm -rf nginx-$NGINX_VER nginx-$NGINX_VER.tar.gz
rm -rf pcre-$PCRE_VER pcre-$PCRE_VER.tar.gz
rm -rf openssl-$OPENSSL_VER openssl-$OPENSSL_VER.tar.gz
rm -rf zlib-$ZLIB_VER zlib-$ZLIB_VER.tar.gz
rm -f main_wrapper.c

echo "[✔] Build completed. Final binary is at $OUTPUT_DIR/$BINARY_NAME"
echo "[i] Run ./nginxpilot directly. If runtime libraries are missing, you'll see a friendly error."
