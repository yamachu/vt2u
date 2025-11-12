#!/bin/bash -e

echo "Building Praat WASM library..."

BUILD_DIR="build"
if [ ! -d "$BUILD_DIR" ]; then
    mkdir -p $BUILD_DIR
fi

cd $BUILD_DIR
cp ../makefile.defs.template ../../praat/makefile.defs

emmake make -C ../../praat -j || true

EM_INC="-I.. -I../../praat -I../../praat/fon -I../../praat/sys -I../../praat/melder -I../../praat/stat"

em++ -c ../sound_formant_api.cpp \
    $EM_INC \
    -O3 \
    -fwasm-exceptions \
    -o sound_formant_api.o
