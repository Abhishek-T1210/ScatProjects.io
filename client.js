// Debounce function to prevent multiple submissions
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

async function submitForm(data, endpoint) {
  const loader = document.querySelector('.loader');
  const responseMessage = document.querySelector('#response-message');

  if (!loader || !responseMessage) {
    console.error('Loader or response message element not found');
    return;
  }

  // Show loader
  loader.style.display = 'block';
  responseMessage.textContent = '';

  try {
    console.time('server-response');
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    console.timeEnd('server-response');

    // Wait for 2 seconds to ensure loader shows
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Hide loader
    loader.style.display = 'none';

    const result = await response.json();
    if (response.status === 202) {
      responseMessage.textContent = result.message;
      console.log(`Acknowledgment received: ${result.message}, Job ID: ${result.jobId}`);
    } else {
      responseMessage.textContent = `Error: ${result.message}`;
      console.error(`Server error: ${result.message}`);
    }
  } catch (error) {
    loader.style.display = 'none';
    responseMessage.textContent = 'Error submitting request. Please try again.';
    console.error('Client Error:', error);
  }
}

// Debounced form submission
const debouncedSubmitForm = debounce(submitForm, 1000);

// Form event listeners
document.querySelector('#callback-form')?.addEventListener('submit', (e) => {
  e.preventDefault();
  const data = {
    phone: document.querySelector('#phone')?.value,
    timestamp: new Date().toISOString(),
    formType: 'callback',
  };
  debouncedSubmitForm(data, 'https://scatprojects-io.onrender.com/callback');
});

document.querySelector('#project-form')?.addEventListener('submit', (e) => {
  e.preventDefault();
  const data = {
    name: document.querySelector('#name')?.value,
    phone: document.querySelector('#phone')?.value,
    branch: document.querySelector('#branch')?.value,
    project: document.querySelector('#project')?.value,
    timestamp: new Date().toISOString(),
    formType: 'project',
  };
  debouncedSubmitForm(data, 'https://scatprojects-io.onrender.com/project');
}); 