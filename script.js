document.addEventListener('DOMContentLoaded', () => {
    const resultsDiv = document.getElementById('results');
    const progressBar = document.getElementById('progress');
    const stepsDiv = document.getElementById('steps');

    resultsDiv.classList.add('hide');
    progressBar.style.width = '0';
    stepsDiv.innerHTML = '';
});

function updateProgress(step, message) {
    const progressBar = document.getElementById('progress');
    const stepsDiv = document.getElementById('steps');
    const progressSteps = [
        { step: 1, width: '25%' },
        { step: 2, width: '50%' },
        { step: 3, width: '75%' },
        { step: 4, width: '100%' }
    ];
    
    const currentStep = progressSteps.find(p => p.step === step);
    if (currentStep) {
        progressBar.style.width = currentStep.width;
        stepsDiv.innerHTML += `<p>${message}</p>`;
    }
}

function isValidURL(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

function fetchFavicon(url) {
    return new Promise((resolve, reject) => {
        const faviconUrl = `${url}/favicon.ico`;
        const img = new Image();
        img.onload = () => resolve(faviconUrl);
        img.onerror = () => reject();
        img.src = faviconUrl;
    });
}

function fetchPageTitle(url) {
    const corsProxy = 'https://cors-anywhere.herokuapp.com/';
    const proxyUrl = corsProxy + url;

    return fetch(proxyUrl)
        .then(response => response.text())
        .then(html => {
            const doc = new DOMParser().parseFromString(html, 'text/html');
            const title = doc.querySelector('title') ? doc.querySelector('title').innerText : 'No Title Found';
            return title;
        })
        .catch(() => 'No Title Found');
}

function checkWebsite() {
    const website = document.getElementById('website').value;
    const resultDiv = document.getElementById('result');
    const stepsDiv = document.getElementById('steps');
    const progressBar = document.getElementById('progress');
    const resultsDiv = document.getElementById('results');

    resultsDiv.classList.add('hide');
    resultsDiv.classList.remove('show');
    stepsDiv.innerHTML = '';
    progressBar.style.width = '0';

    processCheck(website, resultsDiv);
}

function processCheck(website, resultsDiv) {
    updateProgress(1, 'Validating URL...');
    setTimeout(() => {
        const url = website.startsWith('http') ? website : `https://${website}`;
        
        if (!isValidURL(url)) {
            resultsDiv.innerHTML = `
                <strong>${website}</strong> is an invalid URL.<br>
                <span style="color: red;">Error: ${website} does not exist or is DOWN</span>
            `;
            updateProgress(4, 'Validation failed.');
            showResults();
            return;
        }

        updateProgress(2, `Checking ${url}...`);

        const startTime = new Date().getTime();
        
        setTimeout(() => {
            updateProgress(3, 'Sending request...');
            
            fetch(url, { mode: 'no-cors' })
                .then(() => {
                    const endTime = new Date().getTime();
                    const responseTime = endTime - startTime;
                    updateProgress(4, 'Processing response...');
                    Promise.all([
                        fetchFavicon(url),
                        fetchPageTitle(url)
                    ])
                    .then(([favicon, pageTitle]) => {
                        setTimeout(() => {
                            resultsDiv.innerHTML = `
                                <span style="color: green;"><strong>${website}</strong> is UP</span><br>
                                <strong>Website:</strong> ${pageTitle}<br><br>
                                <strong>URL Checked:</strong> <a href="${url}" target="_blank">${url}</a><br>
                                <strong>Response Time:</strong> ${responseTime} ms<br><br>
                                <img src="${favicon}" alt="Page Icon">
                            `;
                            showResults();
                        }, 1000);
                    })
                    .catch(() => {
                        setTimeout(() => {
                            resultsDiv.innerHTML = `
                            <span style="color: grey;"><strong>${website}</strong> is UNKNOWN</span><br>
                                <strong>Website:</strong> ${website}<br><br>
                                <strong>URL Checked:</strong> <a href="${url}" target="_blank">${url}</a><br>
                                <strong>Response Time:</strong> ${responseTime} ms<br><br><br><br>
                                <strong>Try checking the page manually</strong>
                            `;
                            showResults();
                        }, 1000);
                    });
                })
                .catch(() => {
                    const endTime = new Date().getTime();
                    const responseTime = endTime - startTime;
                    updateProgress(4, 'Processing response...');
                    setTimeout(() => {
                        resultsDiv.innerHTML = `
                            <span style="color: red;"><strong>${website}</strong> does not exist or is DOWN</span><br>
                            <strong>Website:</strong> ${website}<br><br>
                            <strong>URL Checked:</strong> <a href="${url}" target="_blank">${url}</a><br>
                            <strong>Response Time:</strong> ${responseTime} ms
                        `;
                        showResults();
                    }, 1000);
                });
        }, 1500);
    }, 1500);
}

function showResults() {
    const resultsDiv = document.getElementById('results');
    resultsDiv.classList.remove('hide');
    resultsDiv.classList.add('show');
}

function pasteURL() {
    const input = document.getElementById('website');
    
    if (navigator.clipboard) {
        navigator.clipboard.readText().then(text => {
            input.value = ''; // Clear existing text
            input.value = text; // Paste new URL
        }).catch(err => {
            console.error('Failed to read clipboard contents: ', err);
            alert('Failed to paste URL. Make sure you have copied a URL to the clipboard.');
        });
    } else {
        alert('Clipboard API is not supported in your browser.');
    }
}
