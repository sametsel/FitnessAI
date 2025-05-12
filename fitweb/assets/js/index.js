document.addEventListener('DOMContentLoaded', function() {
    // Animasyonlu sayfa yükleme
    initializePageAnimations();
    
    // Özellikler bölümü için scroll animasyonu
    initializeScrollAnimations();
    
    // Sayfa içi navigasyon
    initializeSmoothScroll();
    
    // Özellik kartları için hover efektleri
    initializeFeatureCards();
});

/**
 * Sayfa yüklendiğinde animasyonları başlatır
 */
function initializePageAnimations() {
    const heroTitle = document.querySelector('.hero-title');
    const heroSubtitle = document.querySelector('.hero-subtitle');
    const heroButtons = document.querySelector('.hero-buttons');

    if (heroTitle && heroSubtitle && heroButtons) {
        setTimeout(() => {
            heroTitle.style.opacity = '1';
            heroTitle.style.transform = 'translateY(0)';
        }, 100);

        setTimeout(() => {
            heroSubtitle.style.opacity = '1';
            heroSubtitle.style.transform = 'translateY(0)';
        }, 300);

        setTimeout(() => {
            heroButtons.style.opacity = '1';
        }, 500);
    }
}

/**
 * Scroll animasyonlarını başlatır
 */
function initializeScrollAnimations() {
    const featureCards = document.querySelectorAll('.feature-card');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1
    });

    featureCards.forEach(card => {
        observer.observe(card);
    });
}

/**
 * Sayfa içi yumuşak kaydırma
 */
function initializeSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

/**
 * Özellik kartları için hover efektleri
 */
function initializeFeatureCards() {
    const cards = document.querySelectorAll('.feature-card');
    
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px)';
            this.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.2)';
        });

        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.1)';
        });
    });
}

/**
 * CTA (Call to Action) bölümü için animasyon
 */
function initializeCTAAnimation() {
    const ctaSection = document.querySelector('.cta-section');
    
    if (ctaSection) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate');
                }
            });
        }, {
            threshold: 0.5
        });

        observer.observe(ctaSection);
    }
}

// Sayfa yüklendiğinde CTA animasyonunu başlat
initializeCTAAnimation(); 