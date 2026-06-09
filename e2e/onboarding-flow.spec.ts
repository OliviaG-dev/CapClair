import { expect, test } from '@playwright/test'

const sampleAnswer = 'Je veux clarifier mon prochain objectif concret.'

test.beforeEach(async ({ page }) => {
  await page.goto('/onboarding')
  await page.evaluate(() => localStorage.clear())
  await page.goto('/onboarding')
})

test('completes onboarding and reaches synthesis page', async ({ page }) => {
  for (let step = 0; step < 6; step += 1) {
    await page.getByRole('textbox').fill(sampleAnswer)
    const nextLabel = step === 5 ? 'Générer ma synthèse' : 'Suivant'
    await page.getByRole('button', { name: nextLabel }).click()
  }

  await expect(page).toHaveURL(/\/synthese$/)
  await expect(page.getByRole('heading', { level: 1 })).toContainText(
    'Ce que ton parcours met en lumière',
  )
})

test('exposes onboarding progress as accessible progressbar', async ({ page }) => {
  const progressbar = page.getByRole('progressbar', { name: 'Progression du questionnaire' })
  await expect(progressbar).toHaveAttribute('aria-valuenow', '17')

  await page.getByRole('textbox').fill(sampleAnswer)
  await page.getByRole('button', { name: 'Suivant' }).click()

  await expect(progressbar).toHaveAttribute('aria-valuenow', '33')
})
