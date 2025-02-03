const importmap = {
  imports: {
    'lit-html': '/node_modules/lit-html/lit-html.js',
    'lit-html/': '/node_modules/lit-html/',
    tinycolor2: '/node_modules/tinycolor2/dist/tinycolor-min.js',
  },
}

const script = document.createElement('script')
script.type = 'importmap'
script.innerHTML = JSON.stringify(importmap)
document.head.append(script)
