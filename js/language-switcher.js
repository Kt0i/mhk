// language-switcher.js — улучшенная версия

class LanguageSwitcher {
  constructor() {
    this.currentLang = 'en';
    this.translations = {};
    this.init();
  }

  async init() {
    this.currentLang = this.getSavedLanguage() || this.getBrowserLanguage() || 'en';
    await this.loadTranslations(this.currentLang);
    this.applyTranslations();
    this.setupSwitcher();
    this.setupMutationObserver();
  }

  getSavedLanguage() {
    return localStorage.getItem('preferredLang');
  }

  getBrowserLanguage() {
    const lang = navigator.language || navigator.userLanguage;
    return lang.split('-')[0];
  }

  async loadTranslations(lang) {
    try {
      const response = await fetch(`translations/${lang}.json`);
      if (!response.ok) throw new Error(`Could not load ${lang}.json`);
      this.translations = await response.json();
      console.log(`Loaded translations for: ${this.translations?.meta?.language || lang}`);
    } catch (error) {
      console.error(error);
      if (lang !== 'en') {
        console.warn('Falling back to English...');
        await this.loadTranslations('en');
      }
    }
  }

  getNestedTranslation(key, source = this.translations) {
    return key.split('.').reduce((obj, part) => obj?.[part], source);
  }

  applyTranslations() {
    document.documentElement.lang = this.currentLang;

    const elements = document.querySelectorAll('[data-i18n], [data-i18n-placeholder], [data-i18n-attr]');

    elements.forEach(el => this.translateElement(el));
  }

  translateElement(element, key = null) {
    // data-i18n — текстовое содержимое
    if (element.hasAttribute('data-i18n')) {
      const translationKey = key || element.getAttribute('data-i18n');
      const translated = this.getNestedTranslation(translationKey);
      if (translated) element.textContent = translated;
    }

    // data-i18n-placeholder — плейсхолдеры
    if (element.hasAttribute('data-i18n-placeholder')) {
      const placeholderKey = element.getAttribute('data-i18n-placeholder');
      const translated = this.getNestedTranslation(placeholderKey);
      if (translated) element.setAttribute('placeholder', translated);
    }

    // data-i18n-attr — другие атрибуты
    if (element.hasAttribute('data-i18n-attr')) {
      try {
        const attrMap = JSON.parse(element.getAttribute('data-i18n-attr'));
        for (const [attr, key] of Object.entries(attrMap)) {
          const translated = this.getNestedTranslation(key);
          if (translated) element.setAttribute(attr, translated);
        }
      } catch (e) {
        console.error('Invalid JSON in data-i18n-attr:', e);
      }
    }
  }

  setupSwitcher() {
    const buttons = document.querySelectorAll('.lang-switcher button');
    buttons.forEach(button => {
      button.classList.toggle('active', button.dataset.lang === this.currentLang);

      button.addEventListener('click', async () => {
        const newLang = button.dataset.lang;
        if (newLang !== this.currentLang) {
          this.currentLang = newLang;
          localStorage.setItem('preferredLang', newLang);
          await this.loadTranslations(newLang);
          this.applyTranslations();

          // Переключить активную кнопку
          buttons.forEach(btn => btn.classList.remove('active'));
          button.classList.add('active');
        }
      });
    });
  }

  setupMutationObserver() {
    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === 1) {
            const elements = node.matches('[data-i18n], [data-i18n-placeholder], [data-i18n-attr]')
              ? [node]
              : Array.from(node.querySelectorAll('[data-i18n], [data-i18n-placeholder], [data-i18n-attr]'));
            elements.forEach(el => this.translateElement(el));
          }
        });
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });
  }
}

// Гарантированная инициализация после полной загрузки DOM и ресурсов
window.addEventListener('load', () => {
  new LanguageSwitcher();
});
