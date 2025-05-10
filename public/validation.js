document.addEventListener('DOMContentLoaded', () => {
    const imageUpload = document.getElementById('image-upload');
    const runTestButton = document.getElementById('run-test');
    const responseContainer = document.getElementById('response-container'); // Reference to the response container

    imageUpload.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
            if (!validTypes.includes(file.type)) {
                alert('Invalid file type. Please upload an image (JPG, JPEG, PNG, GIF).');
                imageUpload.value = ''; // Clear the input
            }
        }
    });

    runTestButton.addEventListener('click', async () => {
        const file = imageUpload.files[0];
        if (!file) {
            alert('Please upload a valid image before running the test.');
            return;
        }

        // Prepare the form data
        const formData = new FormData();
        formData.append('file', file);

        try {
            // Updated webhook URL
            const webhookUrl = 'https://artuson.app.n8n.cloud/webhook-test/5581a697-fa90-488e-bba5-784e53ca0c73';

            // Send the image to the n8n webhook
            const response = await fetch(webhookUrl, {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                const responseText = await response.text(); // Get plain text response
                responseContainer.textContent = responseText; // Display response in the container
            } else {
                responseContainer.textContent = 'Failed to process the image. Please try again.';
            }
        } catch (error) {
            console.error('Error sending the image:', error);
            responseContainer.textContent = 'An error occurred while sending the image.';
        }
    });
});