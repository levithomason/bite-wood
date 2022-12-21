import { html, render } from '../../node_modules/lit-html/lit-html.js'

const mountNode = document.createElement('div')
mountNode.id = 'root'
document.body.appendChild(mountNode)

function gameEditor() {
  const playPopout = () => {
    window.open(
      // TODO: need to know what url:port we're on programmatically
      'http://127.0.0.1:4321/run-unicorn-run',
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
        <!-- TODO: need to know what url:port we're on programmatically -->
        <iframe
          id="game-iframe"
          src="http://127.0.0.1:4321/games/run-unicorn-run/index.html"
          width="800"
          height="600"
        ></iframe>
      </div>
    </div>
  `
}

export const init = () => {
  return render(gameEditor(), mountNode)
}

init()
