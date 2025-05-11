document.addEventListener('DOMContentLoaded', () => {
    const imageUpload = document.getElementById('image-upload');
    const runTestButton = document.getElementById('run-test');
    const resetFormButton = document.getElementById('reset-form');
    const responseContainer = document.getElementById('response-container');
    const errorMessage = document.getElementById('error-message');
    const errorText = document.getElementById('error-text');
    const overallJudgement = document.getElementById('overall-judgement');
    const modelTest1 = document.getElementById('model-test-1');
    const modelTest2 = document.getElementById('model-test-2');
    const modelTest3 = document.getElementById('model-test-3');
    const imageMetadata = document.getElementById('image-metadata');

    // Debugging logs
    console.log('Elements:', {
        imageUpload,
        runTestButton,
        resetFormButton,
        responseContainer,
        errorMessage,
        errorText,
        overallJudgement,
        modelTest1,
        modelTest2,
        modelTest3,
        imageMetadata,
    });

    // Check if any element is null
    if (!imageUpload || !runTestButton || !resetFormButton || !responseContainer || !errorMessage || !errorText || !overallJudgement || !modelTest1 || !modelTest2 || !modelTest3 || !imageMetadata) {
        console.error('One or more elements are missing in the DOM. Please check the HTML.');
        return;
    }

    // Hide the results container and error message initially
    responseContainer.style.display = 'none';
    errorMessage.style.display = 'none';

    imageUpload.addEventListener('change', async (event) => {
        const file = event.target.files[0];
        if (file) {
            const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
            if (!validTypes.includes(file.type)) {
                alert('Invalid file type. Please upload an image (JPG, JPEG, PNG, GIF).');
                imageUpload.value = ''; // Clear the input
                return;
            }

            // Display file size and type
            const fileSize = (file.size / 1024).toFixed(2) + ' KB'; // Convert to KB
            const fileType = file.type;

            // Extract resolution
            const resolution = await getImageResolution(file);

            // Display metadata
            imageMetadata.textContent = `
File Size: ${fileSize}
File Type: ${fileType}
Resolution: ${resolution.width} x ${resolution.height}
            `;
        }
    });

    runTestButton.addEventListener('click', async () => {
        const file = imageUpload.files[0];
        if (!file) {
            alert('Please upload a valid image before running the test.');
            return;
        }

        // Prepare the form data for n8n
        const formData = new FormData();
        formData.append('file', file);

        try {
            // n8n Webhook URL
            const webhookUrl = 'https://artuson.app.n8n.cloud/webhook-test/5581a697-fa90-488e-bba5-784e53ca0c73';

            // Send the image to the n8n webhook
            const response = await fetch(webhookUrl, {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                const responseData = await response.json(); // Expecting JSON response from n8n
                console.log('Response Data:', responseData); // Debugging log

                // Hide the error message
                errorMessage.style.display = 'none';

                // Show all result boxes
                overallJudgement.style.display = 'block';
                modelTest1.style.display = 'block';
                modelTest2.style.display = 'block';
                modelTest3.style.display = 'block';
                imageMetadata.style.display = 'block';

                // Update the results display
                updateResult(overallJudgement, responseData.overallJudgement);
                updateResult(modelTest1, responseData.modelTest1);
                updateResult(modelTest2, responseData.modelTest2);
                updateResult(modelTest3, responseData.modelTest3);

                // Format and display metadata
                if (responseData.imageMetadata) {
                    const metadata = responseData.imageMetadata;
                    imageMetadata.textContent = `
File Size: ${metadata.fileSize || 'N/A'}
File Type: ${metadata.fileType || 'N/A'}
Resolution: ${metadata.resolution || 'N/A'}
                    `;
                } else {
                    imageMetadata.textContent = 'No Data Received';
                }

                // Show the results container
                responseContainer.style.display = 'block';
            } else {
                // Handle non-200 responses
                showError(`Failed to process the image. Status: ${response.status} - ${response.statusText}`);
            }
        } catch (error) {
            console.error('Error sending the image:', error);
            showError(`An error occurred: ${error.message}`);
        }
    });

    resetFormButton.addEventListener('click', () => {
        // Clear the file input
        imageUpload.value = '';

        // Reset all result fields to their initial state
        overallJudgement.textContent = 'No Data Received';
        modelTest1.textContent = 'No Data Received';
        modelTest2.textContent = 'No Data Received';
        modelTest3.textContent = 'No Data Received';
        imageMetadata.textContent = 'No Data Received';

        // Hide the results container and error message
        responseContainer.style.display = 'none';
        errorMessage.style.display = 'none';

        // Hide all result boxes
        overallJudgement.style.display = 'none';
        modelTest1.style.display = 'none';
        modelTest2.style.display = 'none';
        modelTest3.style.display = 'none';
        imageMetadata.style.display = 'none';
    });

    async function getImageResolution(file) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            const objectUrl = URL.createObjectURL(file);

            img.onload = () => {
                resolve({ width: img.width, height: img.height });
                URL.revokeObjectURL(objectUrl); // Clean up
            };

            img.onerror = (error) => {
                reject(error);
            };

            img.src = objectUrl;
        });
    }

    function updateResult(element, resultData) {
        if (resultData) {
            element.textContent = `${resultData.result || 'No Data Received'} - ${resultData.explanation || ''}`;
        } else {
            element.textContent = 'No Data Received';
        }
    }

    function showError(message) {
        // Log the error to the console for debugging
        console.log('Error:', message);

        // Hide all result boxes
        overallJudgement.style.display = 'none';
        modelTest1.style.display = 'none';
        modelTest2.style.display = 'none';
        modelTest3.style.display = 'none';
        imageMetadata.style.display = 'none';

        // Display only the error message
        errorText.textContent = message;
        errorMessage.style.display = 'block';
        responseContainer.style.display = 'block'; // Ensure the container is visible
    }
});