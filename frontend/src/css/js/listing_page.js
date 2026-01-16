document.addEventListener('DOMContentLoaded', function() {
    // 画像アップロード処理
    const imageUploadArea = document.getElementById('imageUploadArea');
    const imageInput = document.getElementById('imageInput');
    const imagePreviewContainer = document.getElementById('imagePreviewContainer');
    let uploadedImages = [];

    // クリックでファイル選択
    imageUploadArea.addEventListener('click', () => {
        imageInput.click();
    });

    // ドラッグ&ドロップ処理
    imageUploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        imageUploadArea.classList.add('dragover');
    });

    imageUploadArea.addEventListener('dragleave', () => {
        imageUploadArea.classList.remove('dragover');
    });

    imageUploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        imageUploadArea.classList.remove('dragover');
        const files = Array.from(e.dataTransfer.files);
        handleImageFiles(files);
    });

    // ファイル選択時の処理
    imageInput.addEventListener('change', (e) => {
        const files = Array.from(e.target.files);
        handleImageFiles(files);
    });

    // 画像ファイル処理
    function handleImageFiles(files) {
        files.forEach(file => {
            if (uploadedImages.length >= 10) {
                alert('画像は最大10枚まで登録できます。');
                return;
            }

            if (file.size > 5 * 1024 * 1024) {
                alert('ファイルサイズは5MB以下にしてください。');
                return;
            }

            if (!file.type.startsWith('image/')) {
                alert('画像ファイルのみアップロード可能です。');
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                uploadedImages.push(e.target.result);
                updateImagePreviews();
            };
            reader.readAsDataURL(file);
        });
    }
});