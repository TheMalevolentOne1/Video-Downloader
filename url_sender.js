// DOM Elements
const urlInput = document.getElementById('url-input');
const downloadBtn = document.getElementById('download-btn');
const loadingIndicator = document.getElementById('loading');
const errorAlert = document.getElementById('error-alert');
const successAlert = document.getElementById('success-alert');
const resultsSection = document.getElementById('results-section');
const resultsList = document.getElementById('results-list');

// Options elements
const saveImages = document.getElementById('save-images');
const saveDocuments = document.getElementById('save-documents');
const saveHtml = document.getElementById('save-html');
const formatZip = document.getElementById('format-zip');

// Backend API URL - replace with your actual server URL
const API_URL = 'https://your-backend-server.com/api/download';

// Validate URLs
function validateUrls(urls) {
    const urlRegex = /^(https?:\/\/)[a-zA-Z0-9]+([\-\.]{1}[a-zA-Z0-9]+)*\.[a-zA-Z]{2,}(:[0-9]{1,5})?(\/.*)?$/;
    
    // Filter out empty lines
    const filteredUrls = urls.filter(url => url.trim() !== '');
    
    if (filteredUrls.length === 0) {
        showError('Please enter at least one URL');
        return false;
    }
    
    if (filteredUrls.length > 10) {
        showError('Please enter no more than 10 URLs');
        return false;
    }
    
    // Check each URL for validity
    for (const url of filteredUrls) {
        if (!urlRegex.test(url.trim())) {
            showError(`Invalid URL format: ${url}`);
            return false;
        }
    }
    
    return filteredUrls;
}

// Show error message
function showError(message) {
    errorAlert.textContent = message;
    errorAlert.style.display = 'block';
    successAlert.style.display = 'none';
    
    // Hide error after 5 seconds
    setTimeout(() => {
        errorAlert.style.display = 'none';
    }, 5000);
}

// Show success message
function showSuccess(message) {
    successAlert.textContent = message;
    successAlert.style.display = 'block';
    errorAlert.style.display = 'none';
    
    // Hide success after 5 seconds
    setTimeout(() => {
        successAlert.style.display = 'none';
    }, 5000);
}

// Request download from server
async function requestDownload(urls) {
    // Show loading indicator
    loadingIndicator.style.display = 'flex';
    downloadBtn.disabled = true;
    
    try {
        // Prepare request body with URLs and options
        const requestBody = {
            urls: urls,
            options: {
                saveImages: saveImages.checked,
                saveDocuments: saveDocuments.checked,
                saveHtml: saveHtml.checked,
                format: formatZip.checked ? 'zip' : 'folder'
            }
        };
        
        // Send request to server
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });
        
        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Download error:', error);
        showError(`Download failed: ${error.message}`);
        return null;
    } finally {
        // Hide loading indicator
        loadingIndicator.style.display = 'none';
        downloadBtn.disabled = false;
    }
}

// Handle download button click
downloadBtn.addEventListener('click', async () => {
    // Clear previous results
    resultsList.innerHTML = '';
    resultsSection.style.display = 'none';
    
    // Get and validate URLs
    const urls = urlInput.value.split('\n');
    const validUrls = validateUrls(urls);
    
    if (!validUrls) {
        return;
    }
    
    // Request download from server
    const result = await requestDownload(validUrls);
    
    if (result) {
        displayResults(result);
        showSuccess('Downloads completed');
    }
});

// Display download results
function displayResults(data) {
    resultsSection.style.display = 'block';
    
    // Create result items
    data.results.forEach(item => {
        const resultItem = document.createElement('div');
        resultItem.className = 'result-item';
        
        const urlElement = document.createElement('div');
        urlElement.className = 'result-url';
        urlElement.textContent = item.url;
        
        const statusElement = document.createElement('div');
        statusElement.className = `result-status status-${item.status.toLowerCase()}`;
        statusElement.textContent = item.status;
        
        resultItem.appendChild(urlElement);
        resultItem.appendChild(statusElement);
        
        if (item.status === 'SUCCESS' && item.downloadUrl) {
            const downloadLink = document.createElement('a');
            downloadLink.href = item.downloadUrl;
            downloadLink.textContent = 'Download';
            downloadLink.className = 'download-link';
            downloadLink.download = item.filename || 'download';
            resultItem.appendChild(downloadLink);
        }
        
        resultsList.appendChild(resultItem);
    });
    
    // If we have a download URL for the combined file (like a ZIP)
    if (data.downloadUrl) {
        const downloadAllBtn = document.createElement('a');
        downloadAllBtn.href = data.downloadUrl;
        downloadAllBtn.textContent = 'Download All';
        downloadAllBtn.className = 'button download-all';
        downloadAllBtn.download = data.filename || 'downloads.zip';
        
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'button-container';
        buttonContainer.appendChild(downloadAllBtn);
        
        resultsList.appendChild(buttonContainer);
    }
}

// Video URL detection
function isVideoUrl(url) {
    // Common video URL patterns
    const videoPatterns = [
        /youtube\.com\/watch/i,
        /youtu\.be\//i,
        /vimeo\.com\//i,
        /dailymotion\.com\/video/i,
        /\.mp4$/i,
        /\.webm$/i,
        /\.mov$/i
    ];
    
    return videoPatterns.some(pattern => pattern.test(url));
}

// Preview video thumbnail if it's a video URL
urlInput.addEventListener('blur', () => {
    const urls = urlInput.value.split('\n');
    
    // Check if any URL is a video
    const videoUrls = urls.filter(url => isVideoUrl(url.trim()));
    
    if (videoUrls.length > 0) {
        // If we have video URLs, we could add video-specific options
        // This is just a basic example - you'd expand this in your actual app
        const optionsDiv = document.querySelector('.options');
        
        // Only add video quality options if they don't already exist
        if (!document.getElementById('video-options')) {
            const videoOptionsCard = document.createElement('div');
            videoOptionsCard.className = 'option-card';
            videoOptionsCard.id = 'video-options';
            
            videoOptionsCard.innerHTML = `
                <div class="option-title">Video Options</div>
                <div class="radio-group">
                    <label class="radio-label">
                        <input type="radio" name="video-quality" id="quality-high" checked>
                        High Quality
                    </label>
                    <label class="radio-label">
                        <input type="radio" name="video-quality" id="quality-medium">
                        Medium Quality
                    </label>
                    <label class="radio-label">
                        <input type="radio" name="video-quality" id="quality-low">
                        Low Quality
                    </label>
                </div>
            `;
            
            optionsDiv.appendChild(videoOptionsCard);
        }
    }
});
