#!/bin/bash -e
echo "Building SPTK WASM library..."

BUILD_DIR="build"
if [ ! -d "$BUILD_DIR" ]; then
    mkdir -p $BUILD_DIR
fi

cd $BUILD_DIR

emcmake cmake ../../SPTK \
    -DCMAKE_BUILD_TYPE=Release \
    -DSPTK_BUILD_COMMANDS=OFF

emmake make -j

em++ -c ../sptk_wrapper.cc \
  -I../../SPTK/include \
  -O2 \
  -fwasm-exceptions \
  -o sptk_wrapper.o
