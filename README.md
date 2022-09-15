# Electron Transparency Mouse Fix

> **Status:** Sandbox Playground
>
> The library has basic functionality on macOS, but is expected to undergo breaking changes before the initial release of v2.
>
> The `EtmfPreloader` class might need to be split between a `renderer.js` and `preload.js` script for security reasons in the future.

## Supported platforms

It's very hard to support multiple platforms because each OS or lib update may break something. Make sure you test everything on all versions of the platforms you need to support beforehand.

**macOS:** Basic (goal = good ux for base functionality)

**Windows:** Unknown (goal = maximize UX)

**Linux:** Broken (goal = hope even basic functionality is supported, `{forward: true}` seems broken again for `setIgnoreMouseEvents`)

## CDN

This is v2.0.0 and has not been uploaded to NPMJS yet.

## Run the demo

```sh
npm install
npm run dev:demo
```

Rollup is used to merge `preload.js` into a single file since the default security measurements crippled `require()`'s access to the filesystem, which bars you from doing relative imports.

## Use as import

Visit the demo code for usage of imports and package.json for build flows beyond the lib

```sh
npm install
npm run build:lib
```
