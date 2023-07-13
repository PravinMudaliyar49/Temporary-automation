'use-strict';

// TODO: Pick 2 solutions from Codechef and paste in the config file, with "!," appended.

// Name: automation_3 ; Mail: boyaj24731@haizail.com ; Password: !CODECHEf_31 ;
// Start with npm init
// Installed puppeteer using "npm i puppeteer" in the "Codechef submission automation" folder.

// Command (be in this folder i.e. 5--CODECHEF SUBMISSION AUTOMATION): node codechefAutomation.js './configurationFile.txt'

// A considerable feature for the students: Why don't we directly click the submissions tab => Choose Java AC submissions => Pick a submitted solution => Paste it in our IDE. This way, we don't have to carry along a configuration file with solutions!

const puppeteer = require('puppeteer');
const fileSystem = require('fs/promises');
const commandLineArgs = process.argv.slice(2);

// Utility functions:
const fileReading = async function (fileToRead) {
    try {
        const data = await fileSystem.readFile(fileToRead, { encoding: 'utf-8' });
        // console.log(data);
        return data;
    } catch (e) {
        console.error(e);
    }
}; // IMP to have the semi-colon.

const waitAndClick = async function (page, element) {
    //As there can be situations where we've to perform the activities in different pages(tabs)... we won't make the "page" global.
    await page.waitForSelector(element, { visible: true });
    await page.click(element);
};

const waitAndFocus = async function (page, element) {
    await page.waitForSelector(element, { visible: true });
    await page.focus(element);
};

const waitAndType = async function (page, element, toType, options = { delay: 25 }) {
    // TODO: Change the delay as per convenience.
    await page.waitForSelector(element, { visible: true });
    await page.type(element, toType, options);
};

// Selenium was meant to be headless. Hence waiting for a specific isn't recommended and waitForSelector(), etc. are suggested. But, we're not here for purposes like testing, etc. We're here prefering visually working of the things. Hence, I don't think waiting for some hard-coded time is a big deal as we want to see the things happening. Even we can prefer "slowMo: true" when making the browserInstance.
const waitForSomeTime = async function (milliSecs = 3000) {
    await new Promise((resolve, _) => setTimeout(resolve, milliSecs));
};

const workWithControlKey = async function (currPage, key1, key2) {
    await currPage.keyboard.down('ControlLeft');
    await currPage.keyboard.press(key1);
    await currPage.keyboard.press(key2);
    await currPage.keyboard.up('ControlLeft');
};

// Actual automation code logic:

const solveTheGivenQuestion = async function (currPage, questionUrl, solution) {
    try {
        await currPage.bringToFront();
        await currPage.goto(questionUrl);

        await waitAndFocus(currPage, '._textarea_y21ua_219');

        await waitForSomeTime(1000);

        await workWithControlKey(currPage, 'A', 'Backspace');

        await waitAndType(currPage, '._textarea_y21ua_219', solution);

        await workWithControlKey(currPage, 'A', 'X');

        await waitAndClick(currPage, '.ace_editor .ace_scroller');

        await workWithControlKey(currPage, 'A', 'V');

        await waitAndClick(currPage, '#submit_btn');

        await currPage.waitForSelector('._run-result_10alf_2', { visible: true })

        await waitForSomeTime();
    } catch (err) {
        console.error(err);
        throw err;
    }
};

const codechefAutomation = async function (dataArr) {
    try {
        const browserInstance = await puppeteer.launch({
            headless: false,
            args: ['--start-maximized'],
            slowMo: 10,
            defaultViewport: null,
        });

        const [page] = await browserInstance.pages();
        await page.goto(dataArr[0]);

        await waitAndClick(page, '.m-login-button-no-border');

        // page.click() is not working on the email and password fields.

        await waitAndType(page, '#ajax-login-form #edit-name', dataArr[1].trim()); // To remove the whitespaces around the data.

        await waitAndType(page, '#ajax-login-form #edit-pass', dataArr[2].trim());

        await waitAndClick(page, '.cc-login-btn');

        await waitAndClick(page, 'a[href="/practice?itm_medium=navmenu&itm_campaign=practice"]');

        // As there were multiple selectors, we use this technique for clicking the "Attempted" tab:
        await page.waitForSelector('._problemGroupControls__text_kun9n_499');
        const tabs = await page.$$('._problemGroupControls__text_kun9n_499');
        await tabs[1].click();

        await page.waitForSelector('td[data-colindex="1"] div');     // The ".jss1003" is different in Chromium vs actual browser (Chrome). Also, this class varies in different viewports. So this is a better option.

        const questionLinksArr = await page.evaluate(() => {
            // Everything inside of this function will be executed in a headless browser and even the console.log() won't be visible in our NodeJS terminal.
            // The logs will appear in the Chromium's console.
            const questionCodesNodeList = document.querySelectorAll('td[data-colindex="1"] div');
            const questionCodes = [...questionCodesNodeList];

            // Don't need to attach http to the links (like we did in HackerRank):
            // return questionAnchorTags.map(questionAnchorTag => `https://www.codechef.com/${questionAnchorTag.getAttribute('href')}`);

            return questionCodes.map(el => `https://www.codechef.com/problems/${el.textContent}`);
        });

        // Don't use forEach to loop over the questionLinksArr cuz, the callback itself is async. Hence all the pages are opening simultaneously!
        
        // for (let i = 0; i < questionLinksArr.length; i++) {
        for (let i = 0; i < 2; i++) {
            const newPage = await browserInstance.newPage();

            await solveTheGivenQuestion(
                newPage,
                questionLinksArr[i],
                dataArr[i + 3].trim()
            );

            await newPage.close();

            await waitForSomeTime();
        }

        await waitForSomeTime(2000);

        await browserInstance.close();
        console.log('Codechef automation completed');
    } catch (e) {
        // console.error(e);
        console.error(e.message);
    }
}; // IMP to have the semi-colon.

(async () => {
    try {
        const configData = await fileReading(commandLineArgs[0]);
        const configDataArr = configData.split('!,');
        // console.log(configDataArr);
        codechefAutomation(configDataArr);
    } catch (e) {
        console.error(e);
    }
})();
