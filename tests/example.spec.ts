import { test, expect } from '@playwright/test';

test('Test Case 1: Load Website Successfully (Pass)', async ({ page }) => {
  await page.goto('https://playwright.dev/');
  await expect(page).toHaveTitle(/Playwright/);
});

test('Test Case 2: Intentional Failure (Fail)', async ({ page }) => {
  // จงใจให้เทสเฟล เพื่อดูผลใน Dashboard
  await page.goto('https://playwright.dev/');
  await expect(page).toHaveTitle(/FailTitle/); 
});