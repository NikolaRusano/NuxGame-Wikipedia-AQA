import type { Locator, Page } from '@playwright/test';

export class WikipediaMainPage {
  readonly page: Page;
  readonly userMenuButton: Locator;
  readonly preferencesLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.userMenuButton = page.getByRole('button', { name: 'Personal tools' });
    this.preferencesLink = page.locator('#pt-preferences a');
  }

  async goto() {
    await this.page.goto('/wiki/Main_Page');
  }

  async openPreferences() {
    await this.userMenuButton.click();
    await this.preferencesLink.click();
  }
}
