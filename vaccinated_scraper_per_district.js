const puppeteer = require('puppeteer');
const fs = require('fs');

const district = 'Рівненська'
var array = fs.readFileSync('vaccinated_scraper.txt').toString().split("\n");

(async () => {
	const browser = await puppeteer.launch();
    const page = await browser.newPage();
	
	fs.appendFileSync('vaccinated_scraper_per_district.csv', `date,total_population,total_vaccinated,new_vaccinated,vaccinated_percentage,fully_vaccinated,new_fully_vaccinated,fully_vaccinated_percentage\n`)

	const baseSelector = `//div[@id="sort-table"]//tbody/tr/td/a[contains(text(),"${district}")]/ancestor::tr`

	for (let index = 0; index < array.length; index++) {
		await page.goto(`https://index.minfin.com.ua/ua/${array[index]}`);
		console.log(`Link: ${array[index]}`)
		//await page.screenshot({ path: 'example.png' });

		await page.waitForSelector('#sort-table tbody td.bg-total:nth-child(1)')

		const totalElement = (await page.$x(`${baseSelector}/td[2]`))[0]
		const totalValue = await page.evaluate(el => el.textContent, totalElement)

		// Vaccinated (+ New Cases)
		const vaccinatedElement = (await page.$x(`${baseSelector}/td[4]`))[0]
		const vaccinatedValue = await page.evaluate(el => el.textContent, vaccinatedElement)
		const newVaccinatedCasesElement = (await page.$x(`${baseSelector}/td[5]/small`))[0]
		const newVaccinatedCasesValue = await page.evaluate(el => el.textContent, newVaccinatedCasesElement)
		
		// Vaccinated (%)
		const vaccinatedPercentageElement = (await page.$x(`${baseSelector}/td[7]`))[0]
		const vaccinatedPercentageValue = await page.evaluate(el => el.textContent, vaccinatedPercentageElement)

		// Fully Vaccinated (+ New Cases)
		const fullyVaccinatedElement = (await page.$x(`${baseSelector}/td[8]`))[0]
		const fullyVaccinatedValue = await page.evaluate(el => el.textContent, fullyVaccinatedElement)
		const newFullyVaccinatedElement = (await page.$x(`${baseSelector}/td[9]/small`))[0]
		let newFullyVaccinatedValue 
		
		try {
			newFullyVaccinatedValue = await page.evaluate(el => el.textContent, newFullyVaccinatedElement)
		} catch (error) {
			console.log('Not able to find \'newFullyVaccinatedElement\' element')
			newFullyVaccinatedValue = ''
		}

		// Fully Vaccinated (%)
		const fullyVaccinatedPercentageElement = (await page.$x(`${baseSelector}/td[11]`))[0]
		let fullyVaccinatedPercentageValue

		try {
			fullyVaccinatedPercentageValue = await page.evaluate(el => el.textContent, fullyVaccinatedPercentageElement)
		} catch (error) {
			console.log('Not able to find \'fullyVaccinatedPercentageValue\' element')
			fullyVaccinatedPercentageValue = ''
		}

		fs.appendFileSync('vaccinated_scraper_per_district.csv', 
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