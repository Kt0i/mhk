// form-handler.js - Универсальный обработчик форм

document.addEventListener('DOMContentLoaded', () => {
  const forms = document.querySelectorAll('form[data-form]');
  
  forms.forEach(form => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      // Получаем настройки формы
      const formType = form.dataset.form;
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalBtnText = submitBtn.textContent;
      
      // Валидация
      if (!validateForm(form)) return;

      // reCAPTCHA v2 (checkbox) - Получаем токен
      let recaptchaToken = null;
      const recaptchaEl = form.querySelector('.g-recaptcha');
      if (recaptchaEl) {
        // Проверяем, загружен ли reCAPTCHA скрипт
        if (typeof grecaptcha !== 'undefined' && grecaptcha.getResponse) {
          recaptchaToken = grecaptcha.getResponse();
          if (!recaptchaToken) {
            showError(form, submitBtn, originalBtnText, 'Please complete the reCAPTCHA.');
            return;
          }
        } else {
          // reCAPTCHA не загружен или API недоступен, возможно, стоит уведомить пользователя или пропустить
          console.warn('reCAPTCHA script not loaded or API not available.');
          // В продакшене, возможно, здесь стоит предотвратить отправку или отправить без reCAPTCHA,
          // в зависимости от требований к безопасности. Для демо-целей можно продолжить.
        }
      }
      
      // Показ состояния загрузки
      submitBtn.disabled = true;
      submitBtn.innerHTML = createLoader();
      
      try {
        // Подготовка данных
        let payload;
        const formData = new FormData(form);

        if (form.dataset.json) {
          // Если ожидается JSON (например, для Formspree с JSON-форматом)
          payload = getFormJSON(form);
        } else {
          // Если ожидается URL-кодированные данные (по умолчанию для большинства бэкендов)
          payload = new URLSearchParams(formData).toString();
          // Для URLSearchParams нужно добавить reCAPTCHA token отдельно, если он есть
          if (recaptchaToken) {
              payload += `&g-recaptcha-response=${recaptchaToken}`;
          }
        }
        
        // Отправка (пример для Formspree)
        const response = await fetch(form.action || 'https://formspree.io/f/YOUR_FORM_ID', {
          method: 'POST',
          headers: form.dataset.json 
            ? { 'Content-Type': 'application/json' } 
            : { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: payload
        });
        
        if (response.ok) {
          showSuccess(form, submitBtn, originalBtnText);
          // Сброс reCAPTCHA после успешной отправки
          if (recaptchaEl && typeof grecaptcha !== 'undefined' && grecaptcha.reset) {
            grecaptcha.reset();
          }
        } else {
          const errorData = await response.json(); // Попытка прочитать ошибку с сервера
          showError(form, submitBtn, originalBtnText, errorData.error || 'Something went wrong!');
          // Сброс reCAPTCHA при ошибке
          if (recaptchaEl && typeof grecaptcha !== 'undefined' && grecaptcha.reset) {
            grecaptcha.reset();
          }
        }
      } catch (error) {
        console.error('Form submission error:', error);
        showError(form, submitBtn, originalBtnText, 'Network error or server unreachable.');
        // Сброс reCAPTCHA при ошибке
        if (recaptchaEl && typeof grecaptcha !== 'undefined' && grecaptcha.reset) {
          grecaptcha.reset();
        }
      }
    });
  });

  function validateForm(form) {
    let isValid = true;
    const requiredFields = form.querySelectorAll('[required]');
    
    requiredFields.forEach(field => {
      // Сброс предыдущих ошибок
      field.classList.remove('error');
      const errorSibling = field.nextElementSibling;
      if (errorSibling && errorSibling.classList.contains('error-message')) {
          errorSibling.classList.remove('show-error');
      }

      if (!field.value.trim()) {
        field.classList.add('error');
        displayError(field, 'This field is required.');
        isValid = false;
      } else if (field.type === 'email' && !isValidEmail(field.value)) {
        field.classList.add('error');
        displayError(field, 'Please enter a valid email address.');
        isValid = false;
      }
    });
    return isValid;
  }

  function displayError(field, message) {
    let errorEl = field.nextElementSibling;
    if (!errorEl || !errorEl.classList.contains('error-message')) {
      errorEl = document.createElement('div');
      errorEl.classList.add('error-message');
      field.parentNode.insertBefore(errorEl, field.nextSibling);
    }
    errorEl.textContent = message;
    errorEl.classList.add('show-error');
  }

  function clearError(field) {
    field.classList.remove('error');
    const errorSibling = field.nextElementSibling;
    if (errorSibling && errorSibling.classList.contains('error-message')) {
        errorSibling.classList.remove('show-error');
    }
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function getFormJSON(form) {
    const data = {};
    new FormData(form).forEach((value, key) => {
      // Игнорируем g-recaptcha-response при сериализации в JSON для Formspree,
      // так как Formspree ожидает его в корне FormData
      if (key !== 'g-recaptcha-response') {
          data[key] = value;
      }
    });
    // Добавляем reCAPTCHA токен отдельно для JSON, если он есть
    const recaptchaToken = form.querySelector('.g-recaptcha') && typeof grecaptcha !== 'undefined' && grecaptcha.getResponse ? grecaptcha.getResponse() : null;
    if (recaptchaToken) {
        data['g-recaptcha-response'] = recaptchaToken;
    }
    return JSON.stringify(data);
  }

  function createLoader() {
    return `<span class="form-loader"></span>`;
  }

  function showSuccess(form, submitBtn, originalText) {
    form.reset();
    submitBtn.innerHTML = '✓ ' + (form.dataset.success || 'Success!');
    
    const successMsg = form.querySelector('.form-success') || document.getElementById('form-success');
    if (successMsg) {
      successMsg.classList.add('show');
      setTimeout(() => successMsg.classList.remove('show'), 5000);
    }
    
    setTimeout(() => {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }, 3000);
  }

  function showError(form, submitBtn, originalText, errorMessage = 'Error') {
    submitBtn.innerHTML = '✗ ' + (form.dataset.error || 'Error');
    
    const errorMsg = form.querySelector('.form-error') || document.getElementById('form-error');
    if (errorMsg) {
      errorMsg.textContent = errorMessage; // Устанавливаем переданное сообщение об ошибке
      errorMsg.classList.add('show');
      setTimeout(() => errorMsg.classList.remove('show'), 5000);
    }
    
    setTimeout(() => {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }, 3000);
  }
});