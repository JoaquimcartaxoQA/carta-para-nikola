import { expect, test } from './fixtures';
test('inicia uma corrida e permite pausar e continuar', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /começar corrida/i }).click();
  await page.getByRole('button', { name: /escolher cidade/i }).click();
  await page.getByRole('button', { name: /iniciar corrida/i }).click();
  await expect(page.locator('canvas')).toBeVisible();
  await page.getByRole('button', { name: 'Pausar corrida' }).click();
  await expect(page.getByText('Corrida Pausada', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: /continuar correndo/i }).click();
  await expect(page.getByText('Corrida Pausada', { exact: true })).toBeHidden();
});
