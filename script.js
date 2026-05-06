const nameInput = document.getElementById('nameInput');
const displayBtn = document.getElementById('displayBtn');
const output = document.getElementById('output');

displayBtn.addEventListener('click', () => {
  const name = nameInput.value.trim();

  if (name === '') {
    output.textContent = 'Please enter your name.';
    return;
  }

  output.textContent = `Hello, ${name}!`;
});
