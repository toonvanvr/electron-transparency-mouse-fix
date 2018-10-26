<a name="module_TransparencyMouseFix"></a>

## TransparencyMouseFix

* [TransparencyMouseFix](#module_TransparencyMouseFix)
    * [~TransparencyMouseFix](#module_TransparencyMouseFix..TransparencyMouseFix)
        * [new TransparencyMouseFix(options)](#new_module_TransparencyMouseFix..TransparencyMouseFix_new)
        * [.electronWindow](#module_TransparencyMouseFix..TransparencyMouseFix+electronWindow) : <code>electron.BrowserWindow</code>
        * [.htmlWindow](#module_TransparencyMouseFix..TransparencyMouseFix+htmlWindow) : <code>Object</code>
        * [.log](#module_TransparencyMouseFix..TransparencyMouseFix+log) : <code>function</code>
        * [.fixPointerEvents](#module_TransparencyMouseFix..TransparencyMouseFix+fixPointerEvents) : <code>boolean</code>
        * [.registerWindow()](#module_TransparencyMouseFix..TransparencyMouseFix+registerWindow)
        * [.unregisterWindow()](#module_TransparencyMouseFix..TransparencyMouseFix+unregisterWindow)
        * [.onMouseEvent(event)](#module_TransparencyMouseFix..TransparencyMouseFix+onMouseEvent)
        * [.altCheckHover(once)](#module_TransparencyMouseFix..TransparencyMouseFix+altCheckHover) ⇒ <code>boolean</code>

<a name="module_TransparencyMouseFix..TransparencyMouseFix"></a>

### TransparencyMouseFix~TransparencyMouseFix
Provide click-through support for Electron BrowserWindows

**Kind**: inner class of [<code>TransparencyMouseFix</code>](#module_TransparencyMouseFix)  

* [~TransparencyMouseFix](#module_TransparencyMouseFix..TransparencyMouseFix)
    * [new TransparencyMouseFix(options)](#new_module_TransparencyMouseFix..TransparencyMouseFix_new)
    * [.electronWindow](#module_TransparencyMouseFix..TransparencyMouseFix+electronWindow) : <code>electron.BrowserWindow</code>
    * [.htmlWindow](#module_TransparencyMouseFix..TransparencyMouseFix+htmlWindow) : <code>Object</code>
    * [.log](#module_TransparencyMouseFix..TransparencyMouseFix+log) : <code>function</code>
    * [.fixPointerEvents](#module_TransparencyMouseFix..TransparencyMouseFix+fixPointerEvents) : <code>boolean</code>
    * [.registerWindow()](#module_TransparencyMouseFix..TransparencyMouseFix+registerWindow)
    * [.unregisterWindow()](#module_TransparencyMouseFix..TransparencyMouseFix+unregisterWindow)
    * [.onMouseEvent(event)](#module_TransparencyMouseFix..TransparencyMouseFix+onMouseEvent)
    * [.altCheckHover(once)](#module_TransparencyMouseFix..TransparencyMouseFix+altCheckHover) ⇒ <code>boolean</code>

<a name="new_module_TransparencyMouseFix..TransparencyMouseFix_new"></a>

#### new TransparencyMouseFix(options)
Creates an instance of TransparencyMouseFix


| Param | Type |
| --- | --- |
| options | <code>Object</code> | 
| options.electronWindow | <code>electron.BrowserWindow</code> | 
| options.htmlWindow | <code>Window</code> | 
| options.fixPointerEvents | <code>boolean</code> \| <code>string</code> | 
| options.fixPointerEvents | <code>boolean</code> \| <code>string</code> | 

<a name="module_TransparencyMouseFix..TransparencyMouseFix+electronWindow"></a>

#### transparencyMouseFix.electronWindow : <code>electron.BrowserWindow</code>
The window to receive mouseevents

**Kind**: instance property of [<code>TransparencyMouseFix</code>](#module_TransparencyMouseFix..TransparencyMouseFix)  
<a name="module_TransparencyMouseFix..TransparencyMouseFix+htmlWindow"></a>

#### transparencyMouseFix.htmlWindow : <code>Object</code>
The renderers window/global variable

**Kind**: instance property of [<code>TransparencyMouseFix</code>](#module_TransparencyMouseFix..TransparencyMouseFix)  
<a name="module_TransparencyMouseFix..TransparencyMouseFix+log"></a>

#### transparencyMouseFix.log : <code>function</code>
Enable or disable logging with an optional function for styling the console output.

**Kind**: instance property of [<code>TransparencyMouseFix</code>](#module_TransparencyMouseFix..TransparencyMouseFix)  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| fn | <code>boolean</code> \| <code>function</code> | true | false | function (logLevel,...msg) {<..>} |

<a name="module_TransparencyMouseFix..TransparencyMouseFix+fixPointerEvents"></a>

#### transparencyMouseFix.fixPointerEvents : <code>boolean</code>
Emulation for BrowserWindow.setIgnoreMouseEvents(true, {forward: true})
<li>Linux: has no support => fully replaced<br>
<li>Windows: (BUG) only after a reload (see electron/electron#15376)

**Kind**: instance property of [<code>TransparencyMouseFix</code>](#module_TransparencyMouseFix..TransparencyMouseFix)  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| condition | <code>boolean</code> \| <code>string</code> | 'auto'=true | off'=false | 'force' | 'linux' |

<a name="module_TransparencyMouseFix..TransparencyMouseFix+registerWindow"></a>

#### transparencyMouseFix.registerWindow()
Register mouse movement event listeners and prepare styling.

**Kind**: instance method of [<code>TransparencyMouseFix</code>](#module_TransparencyMouseFix..TransparencyMouseFix)  
**Access**: public  
<a name="module_TransparencyMouseFix..TransparencyMouseFix+unregisterWindow"></a>

#### transparencyMouseFix.unregisterWindow()
**Kind**: instance method of [<code>TransparencyMouseFix</code>](#module_TransparencyMouseFix..TransparencyMouseFix)  
<a name="module_TransparencyMouseFix..TransparencyMouseFix+onMouseEvent"></a>

#### transparencyMouseFix.onMouseEvent(event)
Handles events like mousemove, dragover, ..

**Kind**: instance method of [<code>TransparencyMouseFix</code>](#module_TransparencyMouseFix..TransparencyMouseFix)  

| Param | Type |
| --- | --- |
| event | <code>MouseEvent</code> \| <code>DragEvent</code> \| <code>Object.&lt;string, HTMLElement&gt;</code> | 

<a name="module_TransparencyMouseFix..TransparencyMouseFix+altCheckHover"></a>

#### transparencyMouseFix.altCheckHover(once) ⇒ <code>boolean</code>
Circumvent the lack of forwarded mouse events by polling mouse position with requestAnimationFrame

**Kind**: instance method of [<code>TransparencyMouseFix</code>](#module_TransparencyMouseFix..TransparencyMouseFix)  
**Returns**: <code>boolean</code> - True if a element is found besides sinkholes or the main <html> element  

| Param | Type | Description |
| --- | --- | --- |
| once | <code>boolean</code> | Don't request a next animationFrame |

