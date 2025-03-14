import * as fs from 'fs';
import * as path from 'path';

/**
 * Loads locators from JSON file
 * 
 * @param filePath Optional path to the locators file, defaults to locators.json in project root
 * @returns Parsed locators object
 */
export function loadLocators(filePath?: string): Record<string, any> {
    const locatorFile = filePath || process.env.LOCATOR_FILE || 'locators.json';
    const locatorPath = path.resolve(process.cwd(), 'locators', locatorFile);


    if (!fs.existsSync(locatorPath)) {
        throw new Error(`❌ Error: Locator file "${locatorFile}" not found in locators/ folder.`);
    }

    console.log(`✅ Using locator file: ${locatorFile}`); // Debugging info

    try {
        return JSON.parse(fs.readFileSync(locatorPath, 'utf8'));
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(`❌ Failed to load locators from "${locatorPath}": ${error.message}\n${error.stack}`);
        } else {
            throw new Error('❌ An unknown error occurred');
        }
    }
}

/**
 * Parses a field reference of format "page.element"
 * 
 * @param fieldRef Reference string in the format "page.element"
 * @returns Tuple of [pageName, elementName]
 */
export function parseFieldReference(fieldRef: string): [string, string] {
    const parts = fieldRef.split('.');
    if (parts.length !== 2) {
        throw new Error(`Invalid field reference: ${fieldRef}. Expected format: page.element`);
    }
    return [parts[0], parts[1]];
}

/**
 * Gets locator info from the loaded locators object
 * 
 * @param locators Loaded locators object
 * @param fieldRef Reference string in the format "page.element"
 * @returns Locator info object
 */
export function getLocatorInfo(locators: Record<string, any>, fieldRef: string): any {
    const [pageName, elementName] = parseFieldReference(fieldRef);

    try {
        return locators[pageName][elementName];
    } catch (error) {
        throw new Error(`Locator not found for ${fieldRef}`);
    }
}