import { expect, test } from './fixtures';

for (const track of ['Cidade', 'Deserto', 'Floresta']) {
  test(`renderiza ${track}, reinicia e retorna ao menu`, async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /começar corrida/i }).click();
    await page.getByRole('button', { name: new RegExp(`Escolher ${track}`) }).click();
    await page.getByRole('button', { name: /4 voltas/i }).click();
    await page.getByRole('button', { name: /iniciar corrida/i }).click();
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();
    await expect.poll(() => canvas.evaluate((surface: HTMLCanvasElement) => {
      const ctx = surface.getContext('2d');
      return ctx?.getImageData(surface.width / 2, surface.height / 2, 1, 1).data[3];
    })).toBe(255);
    await page.keyboard.press('Escape');
    await expect(page.getByText('Corrida Pausada', { exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Recomeçar Corrida' }).click();
    await expect(page.getByText('Corrida Pausada', { exact: true })).toBeHidden();
    await page.getByRole('button', { name: 'Pausar corrida' }).click();
    await page.getByRole('button', { name: 'Menu Principal' }).click();
    await expect(page.getByRole('button', { name: /começar corrida/i })).toBeVisible();
  });
}

test('alternância de áudio, carta bilíngue e cancelamento de saída', async ({ page }) => {
  await page.goto('/');
  const audio = page.getByRole('button', { name: 'Alternar áudio' });
  const original = await audio.innerText();
  await audio.click();
  await expect(audio).not.toHaveText(original);
  await audio.click();
  await expect(audio).toHaveText(original);
  await page.getByRole('button', { name: /carta para nikola/i }).click();
  await page.getByRole('button', { name: 'English' }).click();
  await expect(page.getByRole('button', { name: 'Back to Menu' })).toBeVisible();
  await page.getByRole('button', { name: 'Português' }).click();
  await page.getByRole('button', { name: 'Voltar ao Menu' }).click();
  await expect(page.getByRole('button', { name: 'Exit' })).toBeVisible();
  await page.getByRole('button', { name: 'Exit' }).click();
  await page.getByRole('button', { name: /voltar e correr mais/i }).click();
  await expect(page.getByRole('button', { name: /começar corrida/i })).toBeVisible();
});

test('exibe ajuda de instalação e reflete instalação do aplicativo', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Instalar Atalho' }).click();
  await expect(page.getByRole('heading', { name: 'Instalar Nikola Race' })).toBeVisible();
  await page.getByRole('button', { name: /entendi, vamos correr/i }).click();
  await page.evaluate(() => window.dispatchEvent(new Event('appinstalled')));
  await expect(page.getByRole('button', { name: 'Instalar Atalho' })).toBeHidden();
});

for (const outcome of ['accepted', 'dismissed'] as const) {
  test(`respeita a resposta ${outcome} à instalação do jogo`, async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Instalar Atalho' }).click();
    await page.evaluate(outcome => {
      const prompt = Object.assign(new Event('beforeinstallprompt', { cancelable: true }), {
        prompt: () => Promise.resolve(),
        userChoice: Promise.resolve({ outcome, platform: 'web' }),
      });
      dispatchEvent(prompt);
    }, outcome);
    await page.getByRole('button', { name: 'Instalar Agora no Aparelho' }).click();
    await page.getByRole('button', { name: /entendi, vamos correr/i }).click();
    // The browser notifies the other hook instance after accepting the prompt.
    if (outcome === 'accepted') await page.evaluate(() => dispatchEvent(new Event('appinstalled')));
    await expect(page.getByRole('button', { name: 'Instalar Atalho' }))[outcome === 'accepted' ? 'toBeHidden' : 'toBeVisible']();
  });
}

test('oferece seis voltas, aceita teclado e controles de toque durante a corrida', async ({ page }) => {
  await page.setViewportSize({ width: 900, height: 520 });
  await page.clock.install();
  await page.goto('/');
  await page.getByRole('button', { name: /começar corrida/i }).click();
  await page.getByRole('button', { name: /escolher deserto/i }).click();
  await page.getByRole('button', { name: /6 voltas/i }).click();
  await page.getByRole('button', { name: /iniciar corrida/i }).click();
  await page.clock.runFor(4300);
  await expect(page.locator('canvas')).toBeVisible();
  for (const key of ['ArrowUp', 'ArrowRight', 'ArrowDown', 'ArrowLeft', 'w', 'A', 'D', 'S', 'h']) {
    await page.keyboard.down(key);
    await page.clock.runFor(35);
    await page.keyboard.up(key);
  }
  for (const label of [/^Acelerar$/, /^Virar para a esquerda$/, /^Virar para a direita$/, /frear/i]) {
    const button = page.getByRole('button', { name: label });
    await button.dispatchEvent('pointerdown');
    await button.dispatchEvent('pointerup');
  }
  await page.getByRole('button', { name: 'Buzinar' }).dispatchEvent('pointerdown');
  await page.keyboard.press('p');
  await expect(page.getByText('Corrida Pausada', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: /continuar correndo/i }).click();
  await expect(page.getByText('Corrida Pausada', { exact: true })).toBeHidden();
});
