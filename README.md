# Electron transparency mouse fix

This script provides a workaround to allow clicking through transparent regions on [Electron](https://electronjs.org/) windows. Progress on an official fix is being discussed [here](https://github.com/electron/electron/issues/1335).

<b style="color: red">Does not work on Linux</b><sup>[<a href="https://github.com/electron/electron/blob/master/docs/api/browser-window.md#winsetignoremouseeventsignore-options">ref</a>]</sup>

## Try it out

A demo is available to quickly test if this script works on your platform.

<p align="center">
  <img align="center" src="./demo/demo.gif" alt="Demo application gif">
</p>

First, you'll need to install Electron.

```bash
npm install -g electron
```

Then simply run the demo application, which should work exactly as in the animated preview above.

```bash
npm run demo
# or: 'electron ./demo/'
```

This code snippet <sup>[[src](./demo/demo.htm)]</sup> is where the magic happens:

```JavaScript
const TransparencyMouseFix = require('../src/electron-transparency-mouse-fix.js')

const fix = new TransparencyMouseFix({
  mode: 'whitelist',
  whiteListElements: [
    document.querySelector('.circle') // after DOMContentLoaded
  ]
})
```

## How it works

Whenever the mouse is moved on screen, your application receives a mousemove event. This event contains a 'path' of elements below your mouse. The items on this list get checked one by one until it triggers a *whitelisted* or *not-blacklisted* match. 

## Bugs

* Whenever you reload the Electron window (CTRL+R, F5, SHIFT+F5, ..) the script stops working. This is probably an easy fix in the script or a deep-rooted Electron bug.

## API Reference <sup>[[src](./src/electron-transparency-mouse-fix.js)]</sup>

### Importing the script

```JavaScript
const TransparencyMouseFix = require('../src/electron-transparency-mouse-fix.js')
```
### Options `{}`

#### Common

* **mode**: *string (default: 'blacklist')* - 'whitelist' or 'blacklist', not case-sensitive
* **log**: *function (default: void())* - log function, eg. `console.log`

#### Whitelist mode

* **whiteListClass**: *string (default: 'mouse-on')* - any element containing this classname gets whitelisted
* **whiteListElements**: *array (default: [])* - an iterable of HTMLElements (becomes a [Set](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set))  
`[document.getElementById('click-me'), document.querySelector('nav .button')]`
* **whiteListSelectors**: *array (default: [])* - an iterable of selector strings (becomes an [Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array))  
`['#click-me', 'nav .button']`

#### Blacklist mode

* **blackeListClass**: *string (default: 'mouse-off')* - any element containing this classname gets blacklisted
* **blackListElements**: *array (default: [])* - an iterable of HTMLElements (becomes a [Set](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set))  
`[document.getElementById('ignore-me'), document.querySelector('nav .bg-effect')]`
* **blackListSelectors**: *array (default: [])* - an iterable of selector strings (becomes an [Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array))  
`['#ignore-me', 'nav .bg-effect']`



### Note on performance
- The code itself is optimized ease of use, not performance. If you wish to speed things up, then strip the         functionality for your use case from the source file. Results may be neglible.
- The code triggers on every mousemove event, even while off the window. Try to check as little as possible elements to provide click-through functionality. Use this as base to decide wether to use a blacklist or a whitelist.
- There's a lot of room left for optimization. Updates may come, but for now it's advised to strip the script down to only the functionality you will use in the `blackListAllows` or `whiteListAllows` functions when not debugging.
- TODO list for optimization can be found at the heading of the source file.