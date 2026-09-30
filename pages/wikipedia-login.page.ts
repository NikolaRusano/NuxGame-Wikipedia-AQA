import type { Locator, Page } from '@playwright/test';

export class WikipediaLoginPage {
  readonly page: Page;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly verificationMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.usernameInput = page.locator('#wpName1');
    this.passwordInput = page.locator('#wpPassword1');
    this.loginButton = page.locator('#wpLoginAttempt');
    this.verificationMessage = page.getByText(/additional verification step/i);
  }

  async goto() {
    await this.page.goto('/wiki/Special:UserLogin');
  }

  async login(username: string, password: string) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }
}
