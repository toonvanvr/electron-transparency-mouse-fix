'use strict';
/**
 * @module TransparencyMouseFix
 */
// TODO: Linux: can't drop files out of electron?
// TODO: Windows: can't drag files over voids
// No external dependencies!

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var electron = require('electron'); // Style for the default console logging tag


var consoleTag = ['%celectron-transparency-mouse-fix', "margin-right: .25em;padding: .1em .4em;border-radius: .25em;background-color: #3eabdc;color: white;font-weight: bold;"];
/** Provide click-through support for Electron BrowserWindows */

var TransparencyMouseFix =
/*#__PURE__*/
function () {
  /**
   * Creates an instance of TransparencyMouseFix
   * @param {Object} options
   * @param {electron.BrowserWindow} options.electronWindow
   * @param {Window} options.htmlWindow
   * @param {(boolean|string)} options.fixPointerEvents
   * @param {(boolean|string)} options.fixPointerEvents
   */
  function TransparencyMouseFix() {
    var _this = this;

    var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        _ref$electronWindow = _ref.electronWindow,
        electronWindow = _ref$electronWindow === void 0 ? electron.remote.getCurrentWindow() : _ref$electronWindow,
        _ref$htmlWindow = _ref.htmlWindow,
        htmlWindow = _ref$htmlWindow === void 0 ? window : _ref$htmlWindow,
        _ref$fixPointerEvents = _ref.fixPointerEvents,
        fixPointerEvents = _ref$fixPointerEvents === void 0 ? 'auto' : _ref$fixPointerEvents,
        _ref$log = _ref.log,
        log = _ref$log === void 0 ? false : _ref$log;

    _classCallCheck(this, TransparencyMouseFix);

    // Set local variables
    // > constant
    // > public

    /**
     * The window to receive mouseevents
     * @type {electron.BrowserWindow}
     */
    this.electronWindow = electronWindow;
    /**
     * The renderers window/global variable
     * @type {Object}
     */

    this.htmlWindow = htmlWindow; // > private

    /**
     * Latches the state of setIgnoreMouseEvents
     * @private
     */

    this._ignoringMouse = true;
    /**
     * Counts the amount of parallel getAnimationFrame loops (maxed to 1)
     * @private
     */

    this.altCheckHover._instanceCount = 0;
    /**
     * Event listener callback tied to 'TransparencyMouseFix' scope
     * @private
     */

    this._scopedOnMouseEvent = function (event) {
      return _this.onMouseEvent(event);
    };
    /**
     * Event listener callback tied to 'TransparencyMouseFix' scope
     * @private
     */


    this._scopedAltCheckHover = function () {
      return _this.altCheckHover();
    };

    this.log = log;
    this.fixPointerEvents = fixPointerEvents; // Register event listeners

    this.registerWindow(); // Workaround for:
    //   https://github.com/electron/electron/issues/15376
    //   setIgnoreMouseEvents({forward: true}) stops forwarding
    //     after a page reload  

    this.htmlWindow.addEventListener('beforeunload', function () {
      sessionStorage.setItem('etmf-reloaded', 'true');
    });
  }

  _createClass(TransparencyMouseFix, [{
    key: "registerWindow",

    /**
     * Register mouse movement event listeners and prepare styling.
     * @access public
     */
    value: function registerWindow() {
      var _this2 = this;

      this.htmlWindow.addEventListener('mousemove', this._scopedOnMouseEvent);
      this.htmlWindow.addEventListener('dragover', this._scopedOnMouseEvent);
      var styleSheet = this.htmlWindow.document.createElement('style');
      styleSheet.classList.add('etmf-css');
      styleSheet.innerHTML = "\n      html {pointer-events: none}\n      body {position: relative}\n    ";
      this.htmlWindow.addEventListener('beforeunload', function () {
        return _this2.unregisterWindow(_this2.htmlWindow);
      });
      this.log && this.log('info', 'Registered event listener');
    }
    /**
     * @access public
     * Remove event listeners.
     */

  }, {
    key: "unregisterWindow",
    value: function unregisterWindow() {
      // keep for manual use
      this.htmlWindow.removeEventListener('mousemove', this._scopedOnMouseEvent);
      this.htmlWindow.removeEventListener('dragover', this._scopedOnMouseEvent);
      this.electronWindow.setIgnoreMouseEvents(false);
      this.log && this.log('info', 'Removed event listener');
    }
    /**
     * Handles events like mousemove, dragover, ..
     * @param {(MouseEvent|DragEvent|Object.<string, HTMLElement>)} event 
     */

  }, {
    key: "onMouseEvent",
    value: function onMouseEvent(event) {
      this.log && this.log('debug', event);
      var sinkHole = event.target.classList.contains('etmf-void'); // Handle dragging events

      if (event.type === 'dragover') {
        event.preventDefault(); // fixes dropping files inside electron

        if (!sinkHole) return;
      } // Is the pointer is hovering an element that receives events?


      var reachedBottom = event.target === this.htmlWindow.document.documentElement;
      var ignoreEvents = sinkHole || reachedBottom;

      if (ignoreEvents) {
        // Latched state
        if (this._ignoringMouse) return;
        this._ignoringMouse = true; // Apply pass-through-window on pointer events

        if (this.fixPointerEvents) {
          // Circumvent forwarding of ignored mouse events
          // TODO: pause on minimize/hide/.. 
          this.electronWindow.setIgnoreMouseEvents(true, {
            forward: false
          });
          this.altCheckHover(true);
          this.log && this.log('info', 'mouse off (polling)');
        } else {
          // Ignore mouse events with built-in forwarding
          this.electronWindow.setIgnoreMouseEvents(true, {
            forward: true
          });
          this.log && this.log('info', 'mouse off (listening)');
        }
      } else {
        // Latched state
        if (!this._ignoringMouse) return;
        this._ignoringMouse = false; // Catch all mouse events

        this.electronWindow.setIgnoreMouseEvents(false);
        this.log && this.log('info', 'mouse on (listening)');
      }
    }
    /**
     * Circumvent the lack of forwarded mouse events by polling mouse position with requestAnimationFrame
     * @param {boolean} once Don't request a next animationFrame
     * @returns {boolean} True if a element is found besides sinkholes or the main <html> element
     */

  }, {
    key: "altCheckHover",
    value: function altCheckHover() {
      var first = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

      // HINT: you can manually stop the loop by incrementing _instanceCount
      if (first) {
        this.altCheckHover._instanceCount++;
      }

      if (this.altCheckHover._instanceCount > 1) {
        this.log && this.log('warn', 'aborting', this.altCheckHover._instanceCount, 'parallel altCheckHover polls');
        this.altCheckHover._instanceCount--;
        return null;
      } // If the cursor is within content bounds, check the element it's hovering,
      //   emulate a MouseMove event with the element as target


      var _electron$screen$getC = electron.screen.getCursorScreenPoint(),
          x = _electron$screen$getC.x,
          y = _electron$screen$getC.y;

      var _this$electronWindow$ = this.electronWindow.getContentBounds(),
          left = _this$electronWindow$.x,
          top = _this$electronWindow$.y,
          width = _this$electronWindow$.width,
          height = _this$electronWindow$.height;

      this.log && this.log('debug', {
        mouse: {
          x: x,
          y: y
        },
        window: {
          left: left,
          top: top,
          width: width,
          height: height
        }
      });

      if (x >= left && x < left + width && y >= top && y < top + height) {
        var tgt = document.elementFromPoint(x - left, y - top); // HINT: update classList checks when expanding code

        if (!tgt.classList.contains('etmf-void') && tgt !== this.htmlWindow.document.documentElement) {
          this.onMouseEvent({
            target: tgt
          });
          this.altCheckHover._instanceCount--;
          return true;
        }
      }

      requestAnimationFrame(this._scopedAltCheckHover);
      return false;
    }
  }, {
    key: "log",
    get: function get() {
      return this._log;
    }
    /**
     * Enable or disable logging with an optional function for styling the console output.
     * @access public
     * @type {function}
     * @param  {(boolean|function)} fn true | false | function (logLevel,...msg) {<..>}
     */
    ,
    set: function set(fn) {
      if (typeof fn === 'function') {
        this._log = fn;
      } else if (fn) {
        this._log = function (level) {
          var _console;

          for (var _len = arguments.length, msg = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
            msg[_key - 1] = arguments[_key];
          }

          (_console = console)[level].apply(_console, consoleTag.concat(msg));
        };
      } else {
        this._log = false;
      }
    }
  }, {
    key: "fixPointerEvents",
    get: function get() {
      return this._fixPointerEvents;
    }
    /** 
     * Emulation for BrowserWindow.setIgnoreMouseEvents(true, {forward: true})
     * <li>Linux: has no support => fully replaced<br>
     * <li>Windows: (BUG) only after a reload (see electron/electron#15376)
     * @access public
     * @type {boolean}
     * @param {(boolean|string)} condition 'auto'=true | off'=false | 'force' | 'linux'
     */
    ,
    set: function set(condition) {
      condition = condition ? typeof condition === 'string' ? condition.toLowerCase() : true : false;

      switch (condition) {
        case false:
        case 'off':
          this._fixPointerEvents = false;
          break;

        case 'force':
          this._fixPointerEvents = true;
          break;

        case 'linux':
          this._fixPointerEvents = process.platform !== 'win32' && process.platform !== 'darwin';
          break;

        case 'auto':
        default:
          this._fixPointerEvents = false;

          if (process.platform === 'win32') {
            if (sessionStorage.getItem('etmf-reloaded') === 'true') this._fixPointerEvents = true;
          } else if (process.platform !== 'darwin') {
            this._fixPointerEvents = true;
          }

          break;
      } // Start polling here so you can manually change the mode.
      // The function is adjusted so you can't have 2 parallel polling loops


      if (this._fixPointerEvents) this.altCheckHover(true);
    }
  }]);

  return TransparencyMouseFix;
}();

module.exports = TransparencyMouseFix;

//# sourceMappingURL=electron-transparency-mouse-fix.js.map