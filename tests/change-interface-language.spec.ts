import { test, expect } from '@playwright/test';
import { GERMAN_UI_TEXT, INITIAL_LANGUAGE, INITIAL_LANGUAGE_CODE, TARGET_LANGUAGE } from '../config/test-data';
import { WikipediaMainPage } from '../pages/wikipedia-main.page';
import { WikipediaPreferencesPage } from '../pages/wikipedia-preferences.page';

test.afterAll(async ({ browser }, testInfo) => {
  const context = await browser.newContext({
    baseURL: testInfo.project.use.baseURL,
    storageState: 'playwright/.auth/user.json',
  });
  try {
    const preferencesPage = new WikipediaPreferencesPage(await context.newPage());
    await preferencesPage.goto();
    await preferencesPage.setInterfaceLanguage(INITIAL_LANGUAGE);
  } finally {
    await context.close();
  }
});

test('Authorised user can switch the interface language to German', async ({ page }) => {
  const mainPage = new WikipediaMainPage(page);
  const preferencesPage = new WikipediaPreferencesPage(page);

  await test.step('Open Wikipedia', async () => {
    await mainPage.goto();
  });

  await test.step('Verify the user is authenticated and the interface is in English', async () => {
    const userName = await page.evaluate(() => (window as any).mw.config.get('wgUserName'));
    expect(userName, 'user must be logged in').toBeTruthy();

    await expect(page.locator('html')).toHaveAttribute('lang', INITIAL_LANGUAGE_CODE);
  });

  await test.step('Open Preferences from the user menu', async () => {
    await mainPage.openPreferences();

    await expect(page).toHaveURL(/\/wiki\/Special:Preferences/);
    await expect(preferencesPage.heading).toBeVisible();
  });

  await test.step('Open the User profile tab', async () => {
    await preferencesPage.openUserProfileTab();

    await expect(preferencesPage.userProfileTab).toHaveAttribute('aria-selected', 'true');
  });

  await test.step('Open the Internationalisation section', async () => {
    await expect(preferencesPage.internationalisation).toBeVisible();
  });

  await test.step('Select German (Deutsch) as the interface language', async () => {
    await preferencesPage.openInterfaceLanguageSelector();
    await preferencesPage.selectInterfaceLanguage(TARGET_LANGUAGE);

    await expect(preferencesPage.languageSelectValue).toHaveValue(TARGET_LANGUAGE.code);
    await expect(preferencesPage.saveButton).toBeEnabled();
  });

  await test.step('Save the preferences', async () => {
    await preferencesPage.save();

    await expect(page).toHaveURL(/\/wiki\/Special:Preferences/);
  });

  await test.step('Verify the interface is displayed in German', async () => {
    await expect(page.locator('html')).toHaveAttribute('lang', TARGET_LANGUAGE.code);

    const userLanguage = await page.evaluate(() => (window as any).mw.config.get('wgUserLanguage'));
    expect(userLanguage).toBe(TARGET_LANGUAGE.code);

    await expect(
      page.getByRole('heading', { name: GERMAN_UI_TEXT.preferencesHeading, level: 1 }),
    ).toBeVisible();
    await expect(
      page.getByRole('tab', { name: GERMAN_UI_TEXT.userProfileTab }),
    ).toBeVisible();
  });
});
