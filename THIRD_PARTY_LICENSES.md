Third-party licenses used by this project

This repository `https://github.com/yamachu/vt2u` includes or references
third-party software. Below are the notable items and how they are
licensed and provided.

- Praat
  - License: GNU General Public License v3 (GPLv3)
  - Location in this repository: Praat is included as a Git submodule at
    `praat/` (run `git submodule update --init --recursive` to populate).
  - WASM build scripts: The scripts and configuration used to build the
    WebAssembly artifact are in `praat-wasm/`.
  - Corresponding Source: When distributing a Praat-based WASM binary to
    users, you must provide the corresponding source (the Praat source and
    any patches or build scripts). In this repository that means ensuring
    the `praat/` submodule (or an archive linking to the exact upstream tag)
    and the `praat-wasm/` build scripts are accessible from the release or
    via a persistent URL.
  - Official upstream: https://github.com/praat/praat.github.io

How we comply

- The project source code itself is released under the MIT License (see
  `LICENSE`).
- GPLv3 components (Praat) are documented here and the GPLv3 text is
  included in `COPYING`.
- Corresponding source for the Praat WASM build and any modifications will
  be placed in `praat-wasm/`.
