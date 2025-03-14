import { Before, After, setWorldConstructor, Status } from '@cucumber/cucumber';
import { chromium, firefox, webkit, BrowserContextOptions } from '@playwright/test';
import { ValueStore } from '../utils/valueStore';
import * as fs from 'fs';
import * as path from 'path';

// Define the World class with video path tracking
class CustomWorld {
    browser: any;
    context: any;
    page: any;
    videoPath: string;
    scenarioName: string;

    constructor() {
        this.browser = null;
        this.context = null;
        this.page = null;
        this.videoPath = '';
        this.scenarioName = '';
    }
}
setWorldConstructor(CustomWorld);

// Create videos directory if it doesn't exist
const videosDir = path.join(process.cwd(), 'videos');
if (!fs.existsSync(videosDir)) {
    fs.mkdirSync(videosDir, { recursive: true });
}

// Before hook
Before(async function (scenario) {
    // Store scenario name for video filename
    this.scenarioName = scenario.pickle.name.replace(/[^a-zA-Z0-9]/g, '_');

    // Launch browser
    const browserType = process.env.BROWSER || 'chromium';
    const headlessMode = process.env.HEADLESS === 'true';

    // Generate a unique video path that includes the scenario name
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const videoFileName = `${this.scenarioName}_${timestamp}.webm`;
    this.videoPath = path.join(videosDir, videoFileName);

    // Set up context options with recording
    const contextOptions: BrowserContextOptions = {
        viewport: {
            width: 1920,
            height: 1080,
        },
        recordVideo: {
            dir: videosDir,
            size: { width: 1280, height: 720 } // Lower resolution for faster processing
        }
    };

    // Launch browser based on type
    switch (browserType.toLowerCase()) {
        case 'firefox':
            this.browser = await firefox.launch({
                headless: headlessMode,
                slowMo: Number(process.env.SLOW_MO || 0)
            });
            break;
        case 'webkit':
            this.browser = await webkit.launch({
                headless: headlessMode,
                slowMo: Number(process.env.SLOW_MO || 0)
            });
            break;
        case 'chromium':
        default:
            this.browser = await chromium.launch({
                headless: headlessMode,
                slowMo: Number(process.env.SLOW_MO || 0)
            });
            break;
    }

    // Create a new context and page for each scenario
    this.context = await this.browser.newContext(contextOptions);
    this.page = await this.context.newPage();

    // Clear the value store for each scenario
    ValueStore.getInstance().clear();
});

// After hook
After(async function (scenario) {
    try {
        // Close page and context first to ensure video is saved
        if (this.page) await this.page.close();
        if (this.context) await this.context.close();

        // Check if test failed
        const failed = scenario?.result?.status === Status.FAILED;

        // Find the actual video file created by Playwright
        if (this.browser) {
            await this.browser.close();

            // If test passed, delete the video to save space
            if (!failed) {
                // Get all files in the videos directory
                const files = fs.readdirSync(videosDir);
                // Find the most recently created video file
                let latestFile = null;
                let latestTime = 0;

                for (const file of files) {
                    const filePath = path.join(videosDir, file);
                    const stats = fs.statSync(filePath);

                    if (stats.isFile() && stats.mtimeMs > latestTime) {
                        latestTime = stats.mtimeMs;
                        latestFile = filePath;
                    }
                }

                // Delete the video if found
                if (latestFile && latestFile.endsWith('.webm')) {
                    fs.unlinkSync(latestFile);
                }
            } else {
                // For failed tests, we could rename the file, but Playwright doesn't make this easy
                // The best approach is to leave the video as-is and implement a separate script
                // that processes the videos directory and renames files based on a mapping file

                // Optionally log the failure for debugging
                console.log(`Test failed: ${this.scenarioName}. Video has been saved.`);
            }
        }
    } catch (error) {
        console.error('Error handling video recording:', error);
    }
});