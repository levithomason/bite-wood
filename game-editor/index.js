import { html, render } from '../node_modules/lit-html/lit-html.js'

const mountNode = document.createElement('div')
mountNode.id = 'root'
document.body.appendChild(mountNode)

function gameEditor() {
  return html`
    <h1>Game Editor</h1>
  `
}

export const init = () => {
  return render(gameEditor(), mountNode)
}

init()
