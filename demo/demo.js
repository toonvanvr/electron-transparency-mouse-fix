const PointerFix = require("../src/electron-transparency-mouse-fix.js")

const fix = new PointerFix()

addEventListener('DOMContentLoaded', makeDraggable)

function makeDraggable () {
  const widget = document.querySelector('.widget')
  const handle = document.querySelector('.handle')

  widget.addEventListener('dragstart', console.log)
  widget.addEventListener('dragend', console.log)
  widget.addEventListener('drag', console.log)
}