// ハンバーガーメニューの開閉機能
const hamburgerMenu = document.getElementById('hamburger-menu');
const hamburgerDropdown = document.getElementById('hamburger-dropdown');

hamburgerMenu.addEventListener('click', function(e) {
    e.stopPropagation();
    hamburgerMenu.classList.toggle('active');
    hamburgerDropdown.classList.toggle('show');
});

// メニュー外をクリックした時にメニューを閉じる
document.addEventListener('click', function(e) {
    if (!hamburgerMenu.contains(e.target) && !hamburgerDropdown.contains(e.target)) {
        hamburgerMenu.classList.remove('active');
        hamburgerDropdown.classList.remove('show');
    }
});

// ドロップダウンアイテムのクリック効果
const dropdownItems = document.querySelectorAll('.dropdown-item');
dropdownItems.forEach(item => {
    item.addEventListener('click', function(e) {
        // e.preventDefault();
        console.log('メニュー選択:', this.textContent);
        // メニューを閉じる
        hamburgerMenu.classList.remove('active');
        hamburgerDropdown.classList.remove('show');
    });
});