import { html } from '../../node_modules/lit-html/lit-html.js'

function levelEditor() {
  return html`
    <div class="level-editor">
      Level
    </div>
  `
}

export const init = () => {
  console.log('levelEditor.init')
  return levelEditor()
}
