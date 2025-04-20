document.addEventListener('DOMContentLoaded', function() {
    // Favori butonları için işlevsellik
    const favoriteButtons = document.querySelectorAll('.btn-icon');
    favoriteButtons.forEach(button => {
        button.addEventListener('click', function() {
            this.classList.toggle('active');
            const icon = this.querySelector('i');
            icon.classList.toggle('fas');
            icon.classList.toggle('far');
        });
    });

    // Filtreleme işlevselliği
    const filters = document.querySelectorAll('.filter-group select');
    filters.forEach(filter => {
        filter.addEventListener('change', function() {
            // Filtreleme mantığı burada uygulanacak
            console.log('Filtre değişti:', this.value);
        });
    });

    // Arama işlevselliği
    const searchInput = document.querySelector('.search-group input');
    const searchButton = document.querySelector('.search-group button');

    searchButton.addEventListener('click', function() {
        performSearch();
    });

    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            performSearch();
        }
    });

    function performSearch() {
        const searchTerm = searchInput.value.trim();
        // Arama mantığı burada uygulanacak
        console.log('Arama yapıldı:', searchTerm);
    }

    // Yeni Program butonu işlevselliği
    const newProgramButton = document.querySelector('.workout-header .btn-primary');
    newProgramButton.addEventListener('click', function() {
        // Yeni program oluşturma modalı veya sayfası açılacak
        console.log('Yeni program oluştur tıklandı');
    });
}); 