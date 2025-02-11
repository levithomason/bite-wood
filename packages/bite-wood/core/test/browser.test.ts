import { expect, test } from 'vitest'
import { page } from '@vitest/browser/context'

const render = () => {
  const p = document.createElement('p')
  p.innerHTML = 'Hi, my name is Alice'
  document.body.appendChild(p)

  const label = document.createElement('label')
  label.setAttribute('for', 'input-id')
  label.innerHTML = 'Username'
  document.body.appendChild(label)

  const input = document.createElement('input')
  input.id = 'input-id'
  input.addEventListener('input', (e: any) => {
    p.innerHTML = `Hi, my name is ${e.target.value}`
  })
  document.body.appendChild(input)
}

test('properly handles form inputs', async () => {
  render() // mount DOM elements

  // Asserts initial state.
  await expect
    .element(page.getByText('Hi, my name is Alice'))
    .toBeInTheDocument()

  // Get the input DOM node by querying the associated label.
  const usernameInput = page.getByLabelText(/username/i)

  // Type the name into the input. This already validates that the input
  // is filled correctly, no need to check the value manually.
  await usernameInput.fill('Bob')

  await expect.element(page.getByText('Hi, my name is Bob')).toBeInTheDocument()
})
