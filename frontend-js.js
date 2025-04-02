// DOM Elements
const videoUrlInput = document.getElementById('videoUrl');
const downloadBtn = document.getElementById('downloadBtn');
const statusText = document.getElementById('status');
const loader = document.getElementById('loader');
const downloadSection = document.getElementById('downloadSection');

// API endpoint (backend server)
const API_ENDPOINT = 'https://your-backend-server.com/api/download';

// Event listeners
downloadBtn.addEventListener('click', processVideo);

async function processVideo() {
    // Get the URL from the input field
    const videoUrl = videoUrlInput.value.trim();
    
    // Validate URL
    if (!videoUrl) {
        updateStatus('Please enter a valid URL', 'error');
        return;
    }
    
    try {
        // Show loading state
        updateStatus('Processing video...', 'loading');
        showLoader(true);
        
        // Send request to backend
        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ url: videoUrl })
        });
        
        // Check if the request was successful
        if (!response.ok) {
            throw new Error(`Server responded with status: ${response.status}`);
        }
        
        // Parse the response
        const data = await response.json();
        
        // Handle the successful response
        showLoader(false);
        updateStatus('Video processed successfully!', 'success');
        
        // Display download link
        createDownloadLink(data);
        
    } catch (error) {
        // Handle errors
        showLoader(false);
        updateStatus(`Error: ${error.message}`, 'error');
        console.error('Download error:', error);
    }
}

function createDownloadLink(data) {
    // Clear previous download links
    downloadSection.innerHTML = '';
    
    // Create new download element
    const downloadContainer = document.createElement('div');
    downloadContainer.className = 'download-item';
    
    // Video title
    const title = document.createElement('h3');
    title.textContent = data.title || 'Download Video';
    downloadContainer.appendChild(title);
    
    // Video info
    if (data.resolution || data.duration) {
        const info = document.createElement('p');
        info.textContent = `${data.resolution || ''} ${data.duration ? `(${data.duration})` : ''}`;
        downloadContainer.appendChild(info);
    }
    
    // Download button
    const downloadLink = document.createElement('a');
    downloadLink.href = data.downloadUrl;
    downloadLink.className = 'download-button';
    downloadLink.textContent = 'Download Now';
    downloadLink.download = data.filename || 'video';
    downloadContainer.appendChild(downloadLink);
    
    // Add to the download section
    downloadSection.appendChild(downloadContainer);
}

function updateStatus(message, type = 'info') {
    statusText.textContent = message;
    statusText.className = `status ${type}`;
}

function showLoader(show) {
    loader.style.display = show ? 'block' : 'none';
}
