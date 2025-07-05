// main.js - Основной JavaScript для сайта Mohammed Khatip

document.addEventListener('DOMContentLoaded', function() {
    // Инициализация гамбургер-меню
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            this.classList.toggle('active');
            navMenu.classList.toggle('active');
            
            // Блокировка скролла при открытом меню
            document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
        });

        // Закрытие меню при клике на ссылку
        document.querySelectorAll('.nav-menu a').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.style.overflow = '';
            });
        });
    }

    // Фиксированная шапка при скролле
    const header = document.querySelector('.header');
    if (header) {
        window.addEventListener('scroll', function() {
            header.classList.toggle('scrolled', window.scrollY > 50);
        });
    }

    // Плавная прокрутка
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);

            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - (header ? header.offsetHeight : 0), // Учитываем высоту шапки
                    behavior: 'smooth'
                });
            }
        });
    });

    // Обработка формы (простой пример для валидации) - ВНИМАНИЕ: это базовая заглушка
    // Для более комплексной обработки форм используется form-handler.js
    document.querySelectorAll('form:not([data-form])').forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            let isValid = true;
            const requiredFields = this.querySelectorAll('[required]');
            
            requiredFields.forEach(field => {
                if (!field.value.trim()) {
                    field.classList.add('error');
                    isValid = false;
                } else {
                    field.classList.remove('error');
                }
            });
            
            if (isValid) {
                // Заглушка для демонстрации
                this.querySelector('button[type="submit"]').textContent = 'Sending...';
                
                // В реальном проекте здесь будет fetch-запрос
                setTimeout(() => {
                    this.reset();
                    this.querySelector('button[type="submit"]').textContent = 'Message Sent!';
                    
                    // Сброс через 3 секунды
                    setTimeout(() => {
                        this.querySelector('button[type="submit"]').textContent = 'Send Message';
                    }, 3000);
                }, 1500);
            }
        });
    });
});
// Автоматическое обновление года в футере
document.addEventListener('DOMContentLoaded', function() {
    const currentYearSpan = document.getElementById('current-year');
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }
});