const puppeteer = require('puppeteer');
const fs = require('fs');

var array = fs.readFileSync('vaccinated_scraper.txt').toString().split("\n");

(async () => {
	const browser = await puppeteer.launch();
    const page = await browser.newPage();
	
	fs.appendFileSync('data.csv', `date,total_population,total_vaccinated,new_vaccinated,vaccinated_percentage,fully_vaccinated,new_fully_vaccinated,fully_vaccinated_percentage\n`)

	for (let index = 0; index < array.length; index++) {
		await page.goto(`https://index.minfin.com.ua/ua/${array[index]}`);
		console.log(`Link: ${array[index]}`)
		//await page.screenshot({ path: 'example.png' });

		await page.waitForSelector('#sort-table tbody td.bg-total:nth-child(1)')

		let totalElement = await page.$('#sort-table tbody td.bg-total:nth-child(2)')
		let totalValue = (await page.evaluate(el => el.textContent, totalElement))

		// Vaccinated (+ New Cases)
		let vaccinatedElement = await page.$('#sort-table tbody td.bg-total:nth-child(4)')
		let vaccinatedValue = await page.evaluate(el => el.textContent, vaccinatedElement)
		let newVaccinatedCasesElement = await page.$('#sort-table tbody td.bg-total:nth-child(5) small')
		let newVaccinatedCasesValue = await page.evaluate(el => el.textContent, newVaccinatedCasesElement)
		
		// Vaccinated (%)
		let vaccinatedPercentageElement = await page.$('#sort-table tbody td.bg-total:nth-child(7)')
		let vaccinatedPercentageValue = await page.evaluate(el => el.textContent, vaccinatedPercentageElement)

		// Fully Vaccinated (+ New Cases)
		let fullyVaccinatedElement = await page.$('#sort-table tbody td.bg-total:nth-child(8)')
		let fullyVaccinatedValue = await page.evaluate(el => el.textContent, fullyVaccinatedElement)
		let newFullyVaccinatedElement = await page.$('#sort-table tbody td.bg-total:nth-child(9) small')
		let newFullyVaccinatedValue 
		
		try {
			newFullyVaccinatedValue = await page.evaluate(el => el.textContent, newFullyVaccinatedElement)
		} catch (error) {
			console.log('Not able to find \'newFullyVaccinatedElement\' element')
			newFullyVaccinatedValue = ''
		}

		// Fully Vaccinated (%)
		let fullyVaccinatedPercentageElement = await page.$('#sort-table tbody td.bg-total:nth-child(11)')
		let fullyVaccinatedPercentageValue

		try {
			fullyVaccinatedPercentageValue = await page.evaluate(el => el.textContent, fullyVaccinatedPercentageElement)
		} catch (error) {
			console.log('Not able to find \'fullyVaccinatedPercentageValue\' element')
			fullyVaccinatedPercentageValue = ''
		}

		fs.appendFileSync('data.csv', 
		`${array[index].toString().split('/')[4]},`
		+ `${totalValue.toString().replace(',','') * 1000},`
		+ `${vaccinatedValue.toString()},`
		+ `${newVaccinatedCasesValue.toString().replace('+','')},`
		+ `${vaccinatedPercentageValue.toString().replace(',','.')},`
		+ `${fullyVaccinatedValue.toString().replace('-','')},`
		+ `${newFullyVaccinatedValue.toString().replace('+','')},`
		+ `${fullyVaccinatedPercentageValue.toString().replace(',','.')}\n`)
	}

	await browser.close();
})();