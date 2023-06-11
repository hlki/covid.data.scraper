const puppeteer = require('puppeteer');
const fs = require('fs');

var array = fs.readFileSync('infected_removed_links.txt').toString().split("\n");

(async () => {
	const browser = await puppeteer.launch();
    const page = await browser.newPage();
	
	fs.appendFileSync('data.csv', `date,total_population,total_infected,new_infection_cases,total_death,new_death_cases,total_recovered,new_recovered_cases,stil_infected\n`)

	for (let index = 0; index < array.length; index++) {
		await page.goto(`https://index.minfin.com.ua/ua/${array[index]}`);
		console.log(`Link: ${array[index]}`)

		await page.waitForSelector('#tm-table tbody tr:nth-child(2) td:not([class*="nopaddingleft"]):nth-child(1)')

		let totalElement = await page.$('#sort-table2 tbody tr:nth-child(2) td:nth-child(2)')
		let totalValue = await page.evaluate(el => el.textContent, totalElement)

		// Infected (+ New Cases)
		let infectedElement = await page.$('#tm-table tbody tr td.bg-grey:not([class*="nopaddingleft"]):nth-child(2)')
		let infectedValue = await page.evaluate(el => el.textContent, infectedElement)
		let newInfectionCasesElement = await page.$('#tm-table tbody tr td.bg-grey:nth-child(3)')
		let newInfectionCasesValue = await page.evaluate(el => el.textContent, newInfectionCasesElement)
		// Mortality (+ New Cases)
		let diedElement = await page.$('#tm-table tbody tr td.bg-grey:not([class*="nopaddingleft"]):nth-child(4)')
		let diedValue = await page.evaluate(el => el.textContent, diedElement)
		let newDeathCasesElement = await page.$('#tm-table tbody tr td.bg-grey:nth-child(5)')
		let newDeathCasesValue = await page.evaluate(el => el.textContent, newDeathCasesElement)
		// Recovered (+ New Cases)
		let recoveredElement = await page.$('#tm-table tbody tr td.bg-grey:not([class*="nopaddingleft"]):nth-child(6)')
		let recoveredValue = await page.evaluate(el => el.textContent, recoveredElement)
		let newRecoveredElement = await page.$('#tm-table tbody tr td.bg-grey:nth-child(7)')
		let newRecoveredValue = await page.evaluate(el => el.textContent, newRecoveredElement)
		
		// Still Infected 
		let illElement = await page.$('#tm-table tbody tr td.bg-grey:not([class*="nopaddingleft"]):nth-child(8)')
		let illValue = await page.evaluate(el => el.textContent, illElement)
		

		fs.appendFileSync('data.csv', 
		`${array[index].toString().split('/')[7]},`
		+ `${totalValue.toString().replace(',','') * 1000},`
		+ `${infectedValue.toString().split('+')[0]},`
		+ `${newInfectionCasesValue.toString().replace('+','')},`
		+ `${diedValue.toString().split('+')[0]},`
		+ `${newDeathCasesValue.toString().replace('+','')},`
		+ `${recoveredValue.toString().split('+')[0]},`
		+ `${newRecoveredValue.toString().replace('+','')},`
		+ `${illValue.toString().replace('+','')}\n`)
	}

	await browser.close();
})();