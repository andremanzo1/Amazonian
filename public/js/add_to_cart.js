document.querySelectorAll('.addToCart').forEach(form => {
  // tracks multiple products
  form.addEventListener('submit', async function(event) {
    event.preventDefault(); // Prevent the default form submission

    // Get form data
    const formData = new FormData(this);
    const data = {};
    formData.forEach((value, key) => {
      data[key] = value;
    });

    // Send AJAX request to the server
    
      fetch('/addToCart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

  });
});