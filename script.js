document.addEventListener('DOMContentLoaded', function() {
    loadFiles();
});

function uploadFile() {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];
    
    if (file) {
        const fileList = getFileList();
        if (getTotalSize() + file.size > 2 * 1024 * 1024 * 1024) { // 2 GB limit
            alert('Storage limit exceeded. Please delete some files.');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(e) {
            const fileData = {
                name: file.name,
                data: e.target.result
            };
            fileList.push(fileData);
            saveFileList(fileList);
            loadFiles();
        };
        reader.readAsDataURL(file);
        
        fileInput.value = ''; // Clear the input
    } else {
        alert('Please select a file to upload.');
    }
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
            viewFile(file.data, file.name);
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

function viewFile(fileData, fileName) {
    const newWindow = window.open();
    newWindow.document.write(`<iframe src="${fileData}" style="width:100%; height:100%; border:none;"></iframe>`);
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
    return fileList.reduce((total, file) => total + (file.data.length * (3 / 4)), 0); // Approximate size
}
