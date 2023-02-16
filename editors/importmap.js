const importmap = {
  imports: {
    'lit-html': 'https://unpkg.com/lit-html@1',
    'lit-html/': 'https://unpkg.com/lit-html@1/',
    tinycolor2: 'https://unpkg.com/tinycolor2@1',
  },
}

const script = document.createElement('script')
script.type = 'importmap'
script.innerHTML = JSON.stringify(importmap)
document.head.append(script)
