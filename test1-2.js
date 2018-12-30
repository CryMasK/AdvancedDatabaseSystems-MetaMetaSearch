const phantom = require('phantom');
const cheerio = require('cheerio'); // CSS Selector
const fs = require('fs'); // FileStream

let content;

async function a(){
	const instance = await phantom.create();
	const page = await instance.createPage();

	await page.on('onResourceRequested', function(requestData) {
		// console.info('Requesting', requestData.url);
	});

	const status = await page.open('https://www.trivago.com.tw/?aDateRange%5Barr%5D=2019-01-01&aDateRange%5Bdep%5D=2019-01-02&aPriceRange%5Bfrom%5D=0&aPriceRange%5Bto%5D=0&iPathId=92368&aGeoCode%5Blat%5D=25.085405&aGeoCode%5Blng%5D=121.561501&iGeoDistanceItem=0');
	await page.includeJs('https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js');
	content = await page.property('content');

	await instance.exit();
	b();
}

a();


function b(){
	let hotels = []
	
	let $ = cheerio.load(content); // load web
//console.log($('h3').next().contents());

	//fs.writeFileSync('./1234.html', content, 'UTF-8');
	//$('.item__name .name__copytext').each((i, elem) => {
	$('.js_co_item').each((i, elem) => {
		console.log(i);
		//console.log($(this).text()); // fail, arrow function & $(this) problem
		//console.log(elem['attribs']['title']);
		
		let $hotelInfo = cheerio.load($(elem).html());
		
		let name = $hotelInfo('.name__copytext').text();
		let price = 
	});
}
