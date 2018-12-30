var phantom = require('phantom');
const cheerio = require('cheerio'); // CSS Selector

async function a(){
	const instance = await phantom.create();
	const page = await instance.createPage();
	await page.on('onResourceRequested', function(requestData) {
		//console.info('Requesting', requestData.url);
	});

	const status = await page.open('https://www.trivago.com.tw/?aDateRange%5Barr%5D=2019-01-01&aDateRange%5Bdep%5D=2019-01-02&aPriceRange%5Bfrom%5D=0&aPriceRange%5Bto%5D=0&iPathId=92368&aGeoCode%5Blat%5D=25.085405&aGeoCode%5Blng%5D=121.561501&iGeoDistanceItem=0');
	const content = await page.property('content');
	let $ = cheerio.load(content); // load web
	let a = [];

//console.log(a)
	await instance.exit();
	
	//console.log($('h3').next().contents());
	$('h3').each((i, elem) => {
		console.log($(this).text());
	});
}

a();