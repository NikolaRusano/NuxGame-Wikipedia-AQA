import { test as setup, expect } from '@playwright/test';
import { INITIAL_LANGUAGE } from '../config/test-data';
import { WikipediaLoginPage } from '../pages/wikipedia-login.page';
import { WikipediaPreferencesPage } from '../pages/wikipedia-preferences.page';

const authFile = 'playwright/.auth/user.json';

setup('authenticate', async ({ page }) => {
  const { WIKI_USERNAME, WIKI_PASSWORD } = process.env;
  if (!WIKI_USERNAME || !WIKI_PASSWORD) {
    throw new Error('WIKI_USERNAME and WIKI_PASSWORD must be set, see .env.example');
  }

  const loginPage = new WikipediaLoginPage(page);
  await loginPage.goto();
  await loginPage.login(WIKI_USERNAME, WIKI_PASSWORD);

  await page.waitForURL(/^https:\/\/en\.wikipedia\.org\//, { timeout: 20_000 }).catch(async (error) => {
    if (await loginPage.verificationMessage.isVisible()) {
      throw new Error('Login was stopped by an additional verification step (hCaptcha)');
    }
    throw error;
  });

  const userName = await page.evaluate(() => (window as any).mw.config.get('wgUserName'));
  expect(userName, 'user must be logged in').toBeTruthy();

  // precondition of the test case: the account interface language is English
  const preferencesPage = new WikipediaPreferencesPage(page);
  await preferencesPage.goto();
  await preferencesPage.setInterfaceLanguage(INITIAL_LANGUAGE);
  await expect(preferencesPage.languageSelectValue).toHaveValue(INITIAL_LANGUAGE.code);

  await page.context().storageState({ path: authFile });
});
