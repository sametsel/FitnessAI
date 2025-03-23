document.addEventListener('DOMContentLoaded', function() {
    // Öğün ekleme butonu işlevselliği
    const addMealButton = document.querySelector('.section-header .btn-primary');
    addMealButton.addEventListener('click', function() {
        // Öğün ekleme modalı açılacak
        console.log('Öğün ekleme modalı açıldı');
    });

    // Öğün düzenleme butonları işlevselliği
    const editButtons = document.querySelectorAll('.btn-outline-small');
    editButtons.forEach(button => {
        button.addEventListener('click', function() {
            const mealCard = this.closest('.meal-card');
            const mealTitle = mealCard.querySelector('.meal-header h3').textContent;
            console.log(`${mealTitle} düzenleniyor...`);
        });
    });

    // Makro besin hedeflerini güncelleme
    function updateMacroProgress() {
        const macroCards = document.querySelectorAll('.macro-card');
        macroCards.forEach(card => {
            const progress = card.querySelector('.progress');
            const values = card.querySelector('p').textContent;
            const [current, total] = values.split('/').map(v => parseInt(v));
            const percentage = (current / total) * 100;
            progress.style.width = `${percentage}%`;
        });
    }

    // Sayfa yüklendiğinde makro ilerlemelerini güncelle
    updateMacroProgress();
}); 