document.addEventListener('DOMContentLoaded', function() {
    loadFiles();
});

function uploadFiles() {
    const fileInput = document.getElementById('fileInput');
    const files = fileInput.files;
    const fileList = getFileList();
    const limit = 2 * 1024 * 1024 * 1024; // 2 GB limit
    let totalSize = getTotalSize();
    const uploadStatus = document.getElementById('uploadStatus');

    Array.from(files).forEach(file => {
        if (totalSize + file.size > limit) {
            uploadStatus.textContent = 'Storage limit exceeded. Please delete some files.';
            return;
        }

        const reader = new FileReader();
        const progressBar = document.getElementById('progressBar');
        const progressText = document.getElementById('progressText');

        reader.onprogress = function(e) {
            if (e.lengthComputable) {
                const percent = Math.round((e.loaded / e.total) * 100);
                progressBar.style.width = percent + '%';
                progressText.textContent = percent + '%';
            }
        };

        reader.onload = function(e) {
            const fileData = {
                name: file.name,
                type: file.type,
                data: e.target.result
            };
            fileList.push(fileData);
            totalSize += file.size;
            saveFileList(fileList);
            loadFiles();
            progressBar.style.width = '100%';
            progressText.textContent = 'Upload Complete';
            uploadStatus.innerHTML = '&#10004; Upload Successful'; // Tick mark
        };

        reader.onerror = function() {
            progressBar.style.width = '0%';
            progressText.textContent = 'Error';
            uploadStatus.textContent = 'Error uploading file.';
        };

        reader.readAsDataURL(file);
    });

    fileInput.value = ''; // Clear the input
}

function loadFiles() {
    const fileList = getFileList();
    const fileListElement = document.getElementById('fileList');
    fileListElement.innerHTML = '';

    fileList.forEach((file, index) => {
        const listItem = document.createElement('li');
        listItem.textContent = file.name;

        const viewButton = document.createElement('button');
        viewButton.textContent = 'View';
        viewButton.onclick = function() {
            viewFile(file.data, file.type);
        };

        const downloadButton = document.createElement('button');
        downloadButton.textContent = 'Download';
        downloadButton.onclick = function() {
            downloadFile(file.data, file.name);
        };

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.onclick = function() {
            deleteFile(index);
        };

        listItem.appendChild(viewButton);
        listItem.appendChild(downloadButton);
        listItem.appendChild(deleteButton);
        fileListElement.appendChild(listItem);
    });
}

function viewFile(fileData, fileType) {
    if (fileType.startsWith('video/') || fileType.startsWith('audio/')) {
        const newWindow = window.open();
        newWindow.document.write(`
            <video controls style="width:100%; height:100%;">
                <source src="${fileData}" type="${fileType}">
                Your browser does not support the video tag.
            </video>
        `);
    } else {
        const newWindow = window.open();
        newWindow.document.write(`<iframe src="${fileData}" style="width:100%; height:100%; border:none;"></iframe>`);
    }
}

function downloadFile(fileData, fileName) {
    const link = document.createElement('a');
    link.href = fileData;
    link.download = fileName;
    link.click();
}

function getFileList() {
    return JSON.parse(localStorage.getItem('fileList')) || [];
}

function saveFileList(fileList) {
    localStorage.setItem('fileList', JSON.stringify(fileList));
}

function deleteFile(index) {
    const fileList = getFileList();
    fileList.splice(index, 1);
    saveFileList(fileList);
    loadFiles();
}

function getTotalSize() {
    const fileList = getFileList();
    return fileList.reduce((total, file) => total + (file.data.length * (3 / 4)), 0) / (1024 * 1024 * 1024); // Approximate size in GB
}
