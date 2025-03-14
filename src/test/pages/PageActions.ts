import { Page } from '@playwright/test';
import { expect } from '@playwright/test';
import { getElement, isJsLocator, performJsAction, getJsElementText, getJsElementValue, getJsElementAttribute, waitForInteractable } from '../utils/elementFinder';
import { loadLocators, getLocatorInfo } from '../utils/locatorLoader';
import { ValueStore } from '../utils/valueStore';

/**
 * Class to handle all page actions, especially table-driven ones
 */
export class PageActions {
    private page: Page;
    private locators: Record<string, any>;
    private valueStore: ValueStore;

    constructor(page: Page) {
        this.page = page;
        this.locators = loadLocators();
        this.valueStore = ValueStore.getInstance();
    }

    /**
     * Perform a series of actions defined in a data table
     * 
     * @param dataTable The data table with actions to perform
     */
    public async performActionsWithTable(dataTable: any): Promise<void> {
        const rows = dataTable.hashes();

        // Store last extracted value in this scope
        let lastExtractedValue: string = '';

        for (const row of rows) {
            const action = row.action.toLowerCase();
            const locatorRef = row.locator;
            const value = row.value || '';

            // Get the locator information
            const locatorInfo = getLocatorInfo(this.locators, locatorRef);

            // Check if we need to use JavaScript execution
            const useJs = isJsLocator(locatorInfo);

            // Perform actions based on whether it's a JS locator or not
            if (useJs) {
                switch (action) {
                    case 'click':
                        await waitForInteractable(this.page, locatorInfo);
                        await performJsAction(this.page, locatorInfo, `element.click()`);
                        break;

                    case 'input':
                    case 'type':
                        await waitForInteractable(this.page, locatorInfo);
                        await performJsAction(this.page, locatorInfo, `element.value = "${value}"`);
                        break;

                    case 'select':
                        await waitForInteractable(this.page, locatorInfo);
                        await performJsAction(this.page, locatorInfo, `
                            const option = Array.from(element.options).find(opt => opt.text === "${value}" || opt.value === "${value}");
                            if (option) {
                                option.selected = true;
                                element.dispatchEvent(new Event('change'));
                            }
                        `);
                        break;

                    case 'extract':
                        await waitForInteractable(this.page, locatorInfo);
                        if (value === 'text') {
                            lastExtractedValue = await getJsElementText(this.page, locatorInfo);
                        } else if (value === 'value') {
                            lastExtractedValue = await getJsElementValue(this.page, locatorInfo);
                        } else {
                            lastExtractedValue = await getJsElementAttribute(this.page, locatorInfo, value);
                        }
                        break;

                    case 'save':
                        await waitForInteractable(this.page, locatorInfo);
                        // Save the last extracted value with the given key
                        this.valueStore.setValue(value, lastExtractedValue);
                        break;

                    case 'check':
                        await waitForInteractable(this.page, locatorInfo);
                        await performJsAction(this.page, locatorInfo, `
                            if (!element.checked) {
                                element.checked = true;
                                element.dispatchEvent(new Event('change'));
                            }
                        `);
                        break;

                    case 'uncheck':
                        await waitForInteractable(this.page, locatorInfo);
                        await performJsAction(this.page, locatorInfo, `
                            if (element.checked) {
                                element.checked = false;
                                element.dispatchEvent(new Event('change'));
                            }
                        `);
                        break;

                    case 'hover':
                        await waitForInteractable(this.page, locatorInfo);
                        await performJsAction(this.page, locatorInfo, `
                            element.dispatchEvent(new MouseEvent('mouseover', {
                                bubbles: true,
                                cancelable: true,
                                view: window
                            }));
                        `);
                        break;

                    case 'verify':
                        await waitForInteractable(this.page, locatorInfo);
                        let expectedValue = value;
                        if (value.startsWith('saved:')) {
                            const savedKey = value.split(':', 2)[1];
                            expectedValue = this.valueStore.getValue(savedKey);
                        }

                        const actualText = await getJsElementText(this.page, locatorInfo);
                        expect(actualText.trim()).toBe(expectedValue.trim());
                        break;

                    case 'wait':
                        await waitForInteractable(this.page, locatorInfo);
                        await this.page.waitForFunction(`() => {
                            const element = ${locatorInfo.value};
                            return element !== null && 
                                   element !== undefined && 
                                   element.offsetParent !== null;
                        }`, { timeout: 30000 });
                        break;

                    default:
                        throw new Error(`Unsupported action for JS locator: ${action}`);
                }
            } else {
                // Get the element using standard locators
                const element = await getElement(this.page, locatorInfo) as any;

                // Perform the specific action based on the action type
                switch (action) {
                    case 'click':
                        await waitForInteractable(this.page, locatorInfo);
                        await element.click();
                        break;

                    case 'input':
                    case 'type':
                        await waitForInteractable(this.page, locatorInfo);
                        await element.fill(value);
                        break;

                    case 'select':
                        await waitForInteractable(this.page, locatorInfo);
                        await element.selectOption(value);
                        break;

                    case 'extract':
                        await waitForInteractable(this.page, locatorInfo);
                        // Extract value based on the specified attribute
                        if (value === 'text') {
                            lastExtractedValue = await element.innerText();
                        } else if (value === 'value') {
                            lastExtractedValue = await element.inputValue();
                        } else {
                            lastExtractedValue = await element.getAttribute(value) || '';
                        }
                        break;

                    case 'save':
                        await waitForInteractable(this.page, locatorInfo);
                        // Save the last extracted value with the given key
                        this.valueStore.setValue(value, lastExtractedValue);
                        break;

                    case 'check':
                        await waitForInteractable(this.page, locatorInfo);
                        await element.check();
                        break;

                    case 'uncheck':
                        await waitForInteractable(this.page, locatorInfo);
                        await element.uncheck();
                        break;

                    case 'hover':
                        await waitForInteractable(this.page, locatorInfo);
                        await element.hover();
                        break;

                    case 'verify':
                        await waitForInteractable(this.page, locatorInfo);
                        let expectedValue = value;
                        if (value.startsWith('saved:')) {
                            // Compare against a previously saved value
                            const savedKey = value.split(':', 2)[1];
                            expectedValue = this.valueStore.getValue(savedKey);
                        }

                        await expect(element).toHaveText(expectedValue);
                        break;

                    case 'wait':
                        await waitForInteractable(this.page, locatorInfo);
                        // Wait for element to be visible
                        await expect(element).toBeVisible();
                        break;
                    case 'clear':
                        await waitForInteractable(this.page, locatorInfo);
                        // Wait for element to be visible
                        await element.clear();
                        break;


                    default:
                        throw new Error(`Unsupported action: ${action}`);
                }
            }

            // Optional delay between actions if specified
            const actionDelay = Number(process.env.ACTION_DELAY || 0);
            if (actionDelay > 0) {
                await this.page.waitForTimeout(actionDelay);
            }
        }
    }

    /**
     * Perform login with details from a data table
     * 
     * @param dataTable The data table with login details
     */
    public async performLoginWithDetails(dataTable: any): Promise<void> {
        // You could have specific logic for login here
        // or just reuse the general table action handler
        await this.performActionsWithTable(dataTable);
    }

    /**
     * Perform booking with details from a data table
     * 
     * @param dataTable The data table with booking details
     */
    public async performBookingWithDetails(dataTable: any): Promise<void> {
        // You could have specific logic for booking here
        // or just reuse the general table action handler
        await this.performActionsWithTable(dataTable);
    }
}