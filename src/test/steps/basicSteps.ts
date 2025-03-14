import { Given, When, Then, setDefaultTimeout } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { getElement, isJsLocator, performJsAction, getJsElementText, waitForInteractable } from '../utils/elementFinder';
import { loadLocators, getLocatorInfo, parseFieldReference } from '../utils/locatorLoader';
import { ValueStore } from '../utils/valueStore';

// World is initialized in hooks and gives us access to the page object
declare global {
    namespace CucumberJS {
        interface World {
            page: any;
            browser: any;
            context: any;
        }
    }
}

setDefaultTimeout(30000);
// Load locators
const locators = loadLocators();
const valueStore = ValueStore.getInstance();

Given('I am on the homepage', async function () {
    const baseUrl = process.env.BASE_URL || 'https://demoqa.com/automation-practice-form';

    await this.page.goto(baseUrl, { waitUntil: 'domcontentloaded', timeout: 45000 });
});

When('I enter {string} in {string}', async function (text, field) {
    const locatorInfo = getLocatorInfo(locators, field);
    await waitForInteractable(this.page, locatorInfo);
    if (isJsLocator(locatorInfo)) {
        await performJsAction(this.page, locatorInfo, `element.value = "${text}"`);
    } else {
        const element = await getElement(this.page, locatorInfo) as any;
        await element.fill(text);
    }
});

When('I click on {string}', async function (field) {
    const locatorInfo = getLocatorInfo(locators, field);
    await waitForInteractable(this.page, locatorInfo);
    if (isJsLocator(locatorInfo)) {
        await performJsAction(this.page, locatorInfo, `element.click()`);
    } else {
        const element = await getElement(this.page, locatorInfo) as any;
        await element.click();
    }
});

Then('I observe that {string} appears', async function (field) {
    const locatorInfo = getLocatorInfo(locators, field);
    await waitForInteractable(this.page, locatorInfo);
    if (isJsLocator(locatorInfo)) {
        await this.page.waitForFunction(`() => {
            const element = ${locatorInfo.value};
            return element !== null && 
                   element !== undefined && 
                   element.offsetParent !== null;
        }`, { timeout: 5000 });
    } else {
        const element = await getElement(this.page, locatorInfo) as any;
        await expect(element).toBeVisible({ timeout: 5000 });
    }
});

When('I select {string} from {string}', async function (option, field) {
    const locatorInfo = getLocatorInfo(locators, field);
    await waitForInteractable(this.page, locatorInfo);
    if (isJsLocator(locatorInfo)) {
        await performJsAction(this.page, locatorInfo, `
            const option = Array.from(element.options).find(opt => opt.text === "${option}" || opt.value === "${option}");
            if (option) {
                option.selected = true;
                element.dispatchEvent(new Event('change'));
            }
        `);
    } else {
        const element = await getElement(this.page, locatorInfo) as any;
        await element.selectOption(option);
    }
});

Then('I should see {string} in {string}', async function (text, field) {
    const locatorInfo = getLocatorInfo(locators, field);
    await waitForInteractable(this.page, locatorInfo);
    if (isJsLocator(locatorInfo)) {
        const actualText = await getJsElementText(this.page, locatorInfo);
        expect(actualText.trim()).toBe(text.trim());
    } else {
        const element = await getElement(this.page, locatorInfo) as any;
        await expect(element).toHaveText(text);
    }
});

When('I use saved value {string} in {string}', async function (savedKey, field) {
    const value = valueStore.getValue(savedKey);
    const locatorInfo = getLocatorInfo(locators, field);
    await waitForInteractable(this.page, locatorInfo);
    if (isJsLocator(locatorInfo)) {
        await performJsAction(this.page, locatorInfo, `element.value = "${value}"`);
    } else {
        const element = await getElement(this.page, locatorInfo) as any;
        await element.fill(value);
    }
});

When('I upload the file {string} to {string}', async function (filePath: string, field: string) {
    const locatorInfo = getLocatorInfo(locators, field);

    await waitForInteractable(this.page, locatorInfo);

    const fileInputElement = await getElement(this.page, locatorInfo) as any;

    await fileInputElement.setInputFiles(filePath);
});

When('I scroll to {string}', async function (field) {
    const locatorInfo = getLocatorInfo(locators, field);

    // Wait for the element to be present before scrolling
    await waitForInteractable(this.page, locatorInfo);

    if (isJsLocator(locatorInfo)) {
        // Scroll using JavaScript if it's a JS locator
        await performJsAction(this.page, locatorInfo, `element.scrollIntoView({ behavior: 'smooth', block: 'center' })`);
    } else {
        // Scroll using Playwright's method
        const element = await getElement(this.page, locatorInfo) as any;
        await element.scrollIntoViewIfNeeded();
    }
});