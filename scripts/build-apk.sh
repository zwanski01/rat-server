#!/bin/bash
set -e

echo "Building Android client..."
cd client
./gradlew assembleRelease

echo "APK built at:"
echo "$(pwd)/app/build/outputs/apk/release/app-release.apk"