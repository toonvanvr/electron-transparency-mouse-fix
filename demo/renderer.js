function handler(event) {
  const enabled = event.target === document.documentElement
  console.log(enabled, event.type, event.target)
  if (event.type === 'pointerover') {
    window.etmf.ignoreMouseEvents(enabled)
  }
}
// window.addEventListener("pointerenter", handler);
document.addEventListener("pointerover", handler);
// window.addEventListener("pointerout", handler);
// window.addEventListener("pointerleave", handler);
