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

Then simply install and run the demo application, which should work exactly as in the animated preview above.

```bash
npm install electron-transparency-mouse-fix
# cd ./node_modules/electron-transparency-mouse-fix
npm run demo
# or: 'electron ./demo/'
```

The magic happens here<sup>[[src](./demo/demo.htm)]</sup>:

```JavaScript
const TransparencyMouseFix = require('electron-transparency-mouse-fix')

const fix = new TransparencyMouseFix({
  mode: 'pointer-events'
})
```
```CSS
.etmf-hole,
.click-on      {pointer-events: all}
.click-through {pointer-events: none}
```

## How it works

Whenever the mouse is moved on screen, your application receives a mousemove event. This event registers the topmost element under your mouse. If this elements uses `pointer-events: none`, it won't be caught by the event, but its parent element will be returned. 

If the event returns any other element than `<html>`, [`setIgnoreMouseEvents()`](https://github.com/electron/electron/blob/master/docs/api/browser-window.md#winsetignoremouseeventsignore-options) will be adjusted so the window catches mouse clicks and other events. An exception is the `.etmf-hole` class which forces click through on any element, even when its parents are configured to catch events.

**Important:** The script sets `pointer-events: none` for the `<html>` tag and every child inherits this rule. Don't forget to set `pointer-events: all` on the elements you wish to use, or the application won't work.

## Bugs

* Whenever you reload the Electron window (CTRL+R, F5, SHIFT+F5, ..) the script stops working. This is probably an easy fix in the script or a deep-rooted Electron bug.
* An `.etmf-hole`:
  - doesn't support drag & drop operations started from within the window.
  - doesn't update css hover rules


## API Reference <sup>[[src](./src/electron-transparency-mouse-fix.js)]</sup>

### Importing the script

```JavaScript
const TransparencyMouseFix = require('electron-transparency-mouse-fix')
```
### Options `{}`

For flexibility, all values can be changed on runtime. This allows you to dynamically add or remove transparent regions!

#### Common

* **electronWindow**: *BrowserWindow (default: electron.remote.getCurrentWindow())* - Electron renderer window handle  
`changing value = not tested yet`
* **mode**: *string (default: 'pointer-events')* - 'pointer-events', ~~'whitelist'~~ or ~~'blacklist'~~, not case-sensitive
* **log**: *function (default: void())* - log function, eg. `console.log`

~~#### Whitelist mode~~

* ~~**whiteListClass**:~~ *string (default: 'mouse-on')* - any element containing this classname gets whitelisted
* ~~**whiteListElements**~~: *array (default: [])* - an iterable of HTMLElements (becomes a [Set](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set))  
`[document.getElementById('click-me'), document.querySelector('nav .button')]`
* ~~**whiteListSelectors**~~: *array (default: [])* - an iterable of selector strings (becomes an [Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array))  
`['#click-me', 'nav .button']`

#### ~~Blacklist mode~~

* ~~**blackListClass**~~: *string (default: 'mouse-off')* - any element containing this classname gets blacklisted
* ~~**blackListElements**~~: *array (default: [])* - an iterable of HTMLElements (becomes a [Set](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set))  
`[document.getElementById('ignore-me'), document.querySelector('nav .bg-effect')]`
* ~~**blackListSelectors**~~: *array (default: [])* - an iterable of selector strings (becomes an [Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array))  
`['#ignore-me', 'nav .bg-effect']`



### Note on performance
- The deprecated `blacklist` and `whitelist` modes are not very performant.
- The script should perform relatively well in `pointer-events` mode.
- Possible improvements are listed as comments in the [source](./src/electron-transparency-mouse-fix.js).