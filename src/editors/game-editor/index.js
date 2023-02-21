import { html, render } from 'lit-html'

const mountNode = document.createElement('div')
mountNode.id = 'root'
document.body.appendChild(mountNode)

function gameEditor() {
  const playPopout = () => {
    window.open(
      './../../games/camera',
      '_blank',
      // TODO: need to know game size programmatically
      'popup,noopener,noreferrer,width=800,height=600',
    )
  }

  return html`
    <div class="game-editor">
      <div class="toolbar">
        <h1>Game Editor</h1>
        <button @click="${playPopout}">Popout</button>
      </div>
      <div class="assets">
        Sprites
        <ul>
          <li>1</li>
          <li>2</li>
        </ul>
        Objects
        <ul>
          <li>1</li>
          <li>2</li>
        </ul>
      </div>
      <div class="main">
        <iframe id="game-iframe" src="../../games/camera/index.html"></iframe>
      </div>
    </div>
  `
}

export const init = () => {
  return render(gameEditor(), mountNode)
}

init()
