const puppeteer = require('puppeteer');
const fs = require('fs');

var array = fs.readFileSync('hospitalized_links.txt').toString().split("\n");

(async () => {
	const browser = await puppeteer.launch(/*{headless: false}*/);
    const page = await browser.newPage();
	
	fs.appendFileSync('hospitalized_data.csv', `date,hospitalized\n`)

	for (let index = 0; index < array.length; index++) {
		await page.goto(`https://web.archive.org${array[index]}`, {waitUntil: 'load', timeout: 0});
        console.log(`Link: ${array[index]}`);
        
        // Date
        const dateRaw = array[index].toString().split('/')[2]
        const dateShort = dateRaw.substring(0, 8);
        const dateFormatted = dateShort.substring(0, 4) + '-' + dateShort.substring(4, 6) + '-' + dateShort.substring(6, 8);

		// Hospitalized
        let hospitalizedValue;

        try {
            await page.waitForSelector('ul.breadcrumbs')
            const hospitalizedElements = await page.$x('//*[contains(text(),"госпіталізовано")]/ancestor::tr/td[2]/p');
            const hospitalizedElement = hospitalizedElements[0];
            hospitalizedValue = await page.evaluate(el => el.textContent, hospitalizedElement);
        } catch (error) {
            console.log('Not able to find \'hospitalizedValue\' element')
            hospitalizedValue = '';
        }
		
        fs.appendFileSync('hospitalized_data.csv', 
		`${dateFormatted},`
		+ `${hospitalizedValue.toString().replace(' ','')}\n`)
	}

	await browser.close();
})();