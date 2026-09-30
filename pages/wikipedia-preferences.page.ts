import type { Locator, Page } from '@playwright/test';

export class WikipediaPreferencesPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly userProfileTab: Locator;
  readonly internationalisation: Locator;
  readonly languageCombobox: Locator;
  readonly languageSelectValue: Locator;
  readonly saveButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: 'Preferences', level: 1 });
    this.userProfileTab = page.getByRole('tab', { name: 'User profile' });
    this.internationalisation = page.locator('#mw-prefsection-personal-i18n');
    this.languageCombobox = this.internationalisation.getByRole('combobox');
    // hidden <select> behind the combobox, holds the language code
    this.languageSelectValue = page.locator('#mw-input-wplanguage');
    this.saveButton = page.locator('#prefcontrol button');
  }

  // uselang=en shows the page in English even if the saved account language is different
  async goto() {
    await this.page.goto('/wiki/Special:Preferences?uselang=en');
  }

  async setInterfaceLanguage(language: { code: string; optionLabel: string }) {
    if ((await this.languageSelectValue.inputValue()) === language.code) {
      return;
    }
    await this.openUserProfileTab();
    await this.openInterfaceLanguageSelector();
    await this.selectInterfaceLanguage(language);
    await this.save();
  }

  async openUserProfileTab() {
    await this.userProfileTab.click();
  }

  async openInterfaceLanguageSelector() {
    await this.languageCombobox.click();
  }

  async selectInterfaceLanguage(language: { code: string; optionLabel: string }) {
    await this.page.getByRole('option', { name: language.optionLabel, exact: true }).click();
  }

  async save() {
    const pageLoaded = this.page.waitForEvent('load');
    await this.saveButton.click();
    await pageLoaded;
  }
}
