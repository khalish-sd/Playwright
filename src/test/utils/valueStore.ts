/**
 * Utility for storing and retrieving values during test execution
 */
export class ValueStore {
    private static instance: ValueStore;
    private values: Record<string, any> = {};

    private constructor() { }

    /**
     * Get the singleton instance
     */
    public static getInstance(): ValueStore {
        if (!ValueStore.instance) {
            ValueStore.instance = new ValueStore();
        }
        return ValueStore.instance;
    }

    /**
     * Store a value with the given key
     */
    public setValue(key: string, value: any): void {
        this.values[key] = value;
        console.log(`Saved value '${value}' as '${key}'`);
    }

    /**
     * Retrieve a stored value
     */
    public getValue(key: string): any {
        if (!(key in this.values)) {
            throw new Error(`No saved value found for key: ${key}`);
        }
        return this.values[key];
    }

    /**
     * Check if a key exists
     */
    public hasValue(key: string): boolean {
        return key in this.values;
    }

    /**
     * Clear all stored values
     */
    public clear(): void {
        this.values = {};
    }
}