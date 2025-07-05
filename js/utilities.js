// utilities.js - Дополнительные функции для сайта

/**
 * 1. Управление модальными окнами
 */
class Modal {
  constructor(triggerSelector, modalSelector) {
    this.triggers = document.querySelectorAll(triggerSelector);
    this.modal = document.querySelector(modalSelector);
    this.closeButtons = this.modal?.querySelectorAll('.modal-close');
    
    this.init();
  }

  init() {
    if (!this.modal) return;
    
    this.triggers.forEach(trigger => {
      trigger.addEventListener('click', (e) => {
        e.preventDefault();
        this.open();
      });
    });

    this.closeButtons.forEach(btn => {
      btn.addEventListener('click', () => this.close());
    });

    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) this.close();
    });
  }

  open() {
    document.body.style.overflow = 'hidden';
    this.modal.classList.add('active');
    document.dispatchEvent(new CustomEvent('modalOpened', { detail: { modal: this.modal.id } }));
  }

  close() {
    document.body.style.overflow = '';
    this.modal.classList.remove('active');
    document.dispatchEvent(new CustomEvent('modalClosed', { detail: { modal: this.modal.id } }));
  }
}

/**
 * 2. Автоматическое обновление года в футере
 */
function updateFooterYear() {
  const yearSpan = document.getElementById('current-year');
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }
}

/**
 * 3. Ленивая загрузка изображений
 */
function lazyLoadImages() {
  const lazyImages = document.querySelectorAll('img.lazy');

  if ('IntersectionObserver' in window) {
    const lazyImageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const lazyImage = entry.target;
          lazyImage.src = lazyImage.dataset.src;
          lazyImage.classList.remove('lazy');
          lazyImageObserver.unobserve(lazyImage);
        }
      });
    });

    lazyImages.forEach(lazyImage => {
      lazyImageObserver.observe(lazyImage);
    });
  } else {
    // Fallback для старых браузеров (загрузка всех изображений)
    lazyImages.forEach(img => img.src = img.dataset.src);
  }
}

/**
 * 4. Инициализация всех утилит при загрузке
 */
document.addEventListener('DOMContentLoaded', () => {
  updateFooterYear();
  lazyLoadImages();
  
  // Добавьте другие инициализации по необходимости
});

/**
 * 5. Вспомогательные функции (debounce, throttle)
 * Эти функции полезны для оптимизации обработчиков событий,
 * таких как скролл, ресайз, ввод текста.
 */
function debounce(func, wait = 100) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

function throttle(func, limit = 300) {
  let lastFunc;
  let lastRan;
  return function() {
    const context = this;
    const args = arguments;
    if (!lastRan) {
      func.apply(context, args);
      lastRan = Date.now();
    } else {
      clearTimeout(lastFunc);
      lastFunc = setTimeout(function() {
        if ((Date.now() - lastRan) >= limit) {
          func.apply(context, args);
          lastRan = Date.now();
        }
      }, limit - (Date.now() - lastRan));
    }
  };
}