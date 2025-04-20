document.addEventListener('DOMContentLoaded', function() {
    // Sekme değiştirme işlevselliği
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Aktif sekme butonunu değiştir
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            // İlgili içeriği göster
            const tabId = button.dataset.tab;
            tabContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === tabId) {
                    content.classList.add('active');
                }
            });
        });
    });

    // Profil fotoğrafı değiştirme
    const changeAvatarBtn = document.querySelector('.change-avatar');
    changeAvatarBtn.addEventListener('click', () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    document.querySelector('.profile-avatar img').src = e.target.result;
                };
                reader.readAsDataURL(file);
            }
        };
        input.click();
    });

    // Ölçümler grafiği
    const ctx = document.getElementById('measurementsChart');
    if (ctx) {
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs'],
                datasets: [{
                    label: 'Kilo (kg)',
                    data: [73, 72, 71, 70, 70],
                    borderColor: '#2ecc71',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: true,
                        text: 'Kilo Takibi'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false
                    }
                }
            }
        });
    }

    // Form gönderme işlemi
    const profileForm = document.querySelector('.profile-form');
    if (profileForm) {
        profileForm.addEventListener('submit', function(e) {
            e.preventDefault();
            // Form verilerini topla ve API'ye gönder
            console.log('Profil bilgileri güncellendi');
        });
    }
}); 