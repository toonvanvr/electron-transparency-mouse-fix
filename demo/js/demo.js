const PointerFix = require("../src/electron-transparency-mouse-fix.js")
const fix = new PointerFix()

function toggleWireFrame() {
    document.body.classList.toggle('show-wireframe')
}

function activateTab(event) {
    const tab = event.target
    const tgt = tab.dataset.tab
    if (!tab.classList.contains('active')) {
        tab.classList.add('active')
        for (const sibling of tab.parentElement.children) {
            if (sibling === tab) continue
            sibling.classList?.remove('active')
        }
        const scrollTgt = document.getElementById(tgt)
        scrollTgt.scrollIntoView({
            behavior: 'smooth'
        })
    }
}

function activateReference(event) {
    let el = event.target
    while (el.tagName !== 'A') {
        el = el.parentElement
    }
    el.classList.toggle('active')
}

document.addEventListener('wheel', (event) => {
    console.log(event)
})
