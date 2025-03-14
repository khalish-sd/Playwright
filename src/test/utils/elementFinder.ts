import { Page, Locator, JSHandle, expect } from '@playwright/test';

export async function getElement(page: Page, locatorInfo: any): Promise<Locator | JSHandle> {
    const { type, strategy, value } = locatorInfo;
    if (!type || !strategy || !value) {
        throw new Error("Invalid locator format: 'type', 'strategy', and 'value' are required");
    }
    // Handle JavaScript-based locators
    if (type === "js") {
        const element = await page.evaluateHandle(`() => ${value}`);
        if (await element.evaluate(el => el === null)) {
            throw new Error(`Element not found using JavaScript selector: ${value}`);
        }
        return element;
    }
    // Handle Playwright & Selenium-style locators
    switch (strategy.toLowerCase()) {
        case "id":
            return page.locator(`#${value}`);
        case "name":
            return page.locator(`[name="${value}"]`);
        case "css":
        case "css_selector":
            return page.locator(value);
        case "xpath":
            return page.locator(`xpath=${value}`);
        case "link_text":
            return page.getByText(value);
        case "partial_link_text":
            return page.getByText(value, { exact: false });
        case "tag_name":
            return page.locator(value);
        case "class_name":
            return page.locator(`.${value}`);
        case "text":
            return page.locator(`text=${value}`);
        case "role":
            return page.getByRole(value, locatorInfo.options || {});
        case "label":
            return page.getByLabel(value, { exact: !!locatorInfo.exact });
        case "placeholder":
            return page.getByPlaceholder(value, { exact: !!locatorInfo.exact });
        case "alt_text":
            return page.getByAltText(value, { exact: !!locatorInfo.exact });
        case "title":
            return page.getByTitle(value, { exact: !!locatorInfo.exact });
        case "test_id":
            return page.getByTestId(value);
        default:
            throw new Error(`Unsupported locator strategy: ${strategy}`);
    }
}

// Add this to elementFinder.ts
export async function waitForInteractable(page: Page, locatorInfo: any, timeout: number = 30000): Promise<void> {
    if (isJsLocator(locatorInfo)) {
        // For JavaScript locators
        await page.waitForFunction(`() => {
      const element = ${locatorInfo.value};
      if (!element) return false;
      
      // Check if element is visible
      const style = window.getComputedStyle(element);
      const isVisible = style.display !== 'none' && 
                         style.visibility !== 'hidden' && 
                         element.offsetParent !== null;
      
      // Check if element is not disabled
      const isEnabled = !element.disabled;
      
      // Check if element is not covered by other elements
      const rect = element.getBoundingClientRect();
      const elementAtPoint = document.elementFromPoint(
        rect.left + rect.width/2, 
        rect.top + rect.height/2
      );
      const isNotCovered = element.contains(elementAtPoint) || elementAtPoint === element;
      
      return isVisible && isEnabled && isNotCovered;
    }`, { timeout: timeout });
    } else {
        // For standard locators
        const element = await getElement(page, locatorInfo) as any;

        // Wait for element to be visible
        await expect(element).toBeVisible({ timeout: timeout });

        // Wait for element to be enabled
        await expect(element).toBeEnabled({ timeout: timeout });
    }
}

// Helper function to check if a locator is a JavaScript locator
export function isJsLocator(locatorInfo: any): boolean {
    return locatorInfo && locatorInfo.type === 'js';
}

// Helper function to perform JS actions
export async function performJsAction(page: Page, locatorInfo: any, action: string): Promise<any> {
    // Wait for the element to be available
    await page.waitForFunction(`() => {
        const element = ${locatorInfo.value};
        return element !== null && element !== undefined;
    }`, { timeout: 30000 });

    // Perform the action
    return page.evaluate(`() => {
        const element = ${locatorInfo.value};
        ${action};
        return true;
    }`);
}

// Helper function to get text from a JS element
export async function getJsElementText(page: Page, locatorInfo: any): Promise<string> {
    return page.evaluate(`() => {
        const element = ${locatorInfo.value};
        return element ? element.textContent || '' : '';
    }`);
}

// Helper function to get value from a JS element
export async function getJsElementValue(page: Page, locatorInfo: any): Promise<string> {
    return page.evaluate(`() => {
        const element = ${locatorInfo.value};
        return element ? element.value || '' : '';
    }`);
}

// Helper function to get attribute from a JS element
export async function getJsElementAttribute(page: Page, locatorInfo: any, attribute: string): Promise<string> {
    return page.evaluate(`() => {
        const element = ${locatorInfo.value};
        return element ? element.getAttribute("${attribute}") || '' : '';
    }`);
}