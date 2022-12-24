import { html, render } from '../../node_modules/lit-html/lit-html.js'

const mountNode = document.createElement('div')
mountNode.id = 'root'
document.body.appendChild(mountNode)

function levelEditor() {
  return html` <h1>Level Editor</h1> `
}

export const init = () => {
  return render(levelEditor(), mountNode)
}

init()
