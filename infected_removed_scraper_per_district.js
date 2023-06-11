const puppeteer = require('puppeteer');
const fs = require('fs');

const district = 'Рівненська'
var array = fs.readFileSync('infected_removed_links.txt').toString().split("\n");

(async () => {
	const browser = await puppeteer.launch();
    const page = await browser.newPage();
	
	fs.appendFileSync('infected_removed_scraper_per_district.csv', `date,total_population,total_infected,new_infection_cases,total_death,new_death_cases,total_recovered,new_recovered_cases,stil_infected\n`)

	const baseSelector = `//div[@class="sort1-table"]//tbody/tr/td/a[contains(text(),"${district}")]/ancestor::tr`

	for (let index = 0; index < array.length; index++) {
		await page.goto(`https://index.minfin.com.ua/ua/${array[index]}`);
		console.log(`Link: ${array[index]}`)

		await page.waitForSelector('#tm-table tbody tr:nth-child(2) td:not([class*="nopaddingleft"]):nth-child(1)')
		
		const districtElement =  (await page.$x(`//div[@id="sort-table2"]//tbody/tr/td/a[contains(text(),"${district}")]`))[0]

		if (districtElement != null) {
			const totalElement = (await page.$x(`//div[@id="sort-table2"]//tbody/tr/td/a[contains(text(),"${district}")]/ancestor::tr/td[2]`))[0]
			const totalValue = await page.evaluate(el => el.textContent, totalElement)

			// Infected (+ New Cases)
			const infectedElement = (await page.$x(`${baseSelector}/td[2]`))[0]
			const infectedValue = await page.evaluate(el => el.textContent, infectedElement)
			const newInfectionCasesElement = (await page.$x(`${baseSelector}/td[3]/small`))[0]
			const newInfectionCasesValue = await page.evaluate(el => el.textContent, newInfectionCasesElement)
			// Mortality (+ New Cases)
			const diedElement = (await page.$x(`${baseSelector}/td[4]`))[0]
			const diedValue = await page.evaluate(el => el.textContent, diedElement)
			const newDeathCasesElement = (await page.$x(`${baseSelector}/td[5]/small`))[0]
			const newDeathCasesValue = await page.evaluate(el => el.textContent, newDeathCasesElement)
			// Recovered (+ New Cases)
			const recoveredElement = (await page.$x(`${baseSelector}/td[6]`))[0]
			const recoveredValue = await page.evaluate(el => el.textContent, recoveredElement)
			const newRecoveredElement = (await page.$x(`${baseSelector}/td[7]/small`))[0]
			const newRecoveredValue = await page.evaluate(el => el.textContent, newRecoveredElement)
			
			// Still Infected 
			const illElement = (await page.$x(`${baseSelector}/td[8]`))[0]
			const illValue = await page.evaluate(el => el.textContent, illElement)
			
			fs.appendFileSync('infected_removed_scraper_per_district.csv', 
			`${array[index].toString().split('/')[3]},`
			+ `${totalValue.toString().replace(',','') * 1000},`
			+ `${infectedValue.toString().split('+')[0]},`
			+ `${newInfectionCasesValue.toString().replace('+','')},`
			+ `${diedValue.toString().split('+')[0]},`
			+ `${newDeathCasesValue.toString().replace('+','')},`
			+ `${recoveredValue.toString().split('+')[0]},`
			+ `${newRecoveredValue.toString().replace('+','')},`
			+ `${illValue.toString().replace('+','')}\n`)	
		}
	}

	await browser.close();
})();