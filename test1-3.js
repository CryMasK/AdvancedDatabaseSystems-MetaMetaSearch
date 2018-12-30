const phantom = require('phantom');
const cheerio = require('cheerio'); // CSS Selector
const fs = require('fs'); // FileStream

let content;
let url = 'https://www.trivago.com.tw/?aDateRange%5Barr%5D=2018-12-31&aDateRange%5Bdep%5D=2019-01-01&aPriceRange%5Bfrom%5D=0&aPriceRange%5Bto%5D=0&iRoomType=7&aRooms%5B0%5D%5Badults%5D=2&cpt2=72525%2F200&iViewType=0&bIsSeoPage=0&sortingId=1&slideoutsPageItemId=&iGeoDistanceLimit=20000&address=&addressGeoCode=&offset=0';

function delay(ms){
	return new Promise(function(resolve, reject){
		setTimeout(resolve, ms);
	});
}

async function a(){
	const instance = await phantom.create();
	const page = await instance.createPage();

	/*await page.on('onResourceRequested', function(requestData) {
		console.info('Requesting', requestData.url);
	});*/

	//await page.includeJs('https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js');
	const status = await page.open(url);
	
	content = await page.property('content');
	/**/let $ = cheerio.load(content); // load web
	while ( !$('h2.name__copytext').length ){
		console.log($('h2.name__copytext').length)
		
		await delay(3000);
		await page.reload();
		content = await page.property('content');
		$ = cheerio.load(content); // load web
	}

	await instance.exit();
	b();
}

a();


function b(){
	let hotels = []
	
	let $ = cheerio.load(content); // load web
//console.log($('h3').next().contents());
	fs.writeFileSync('./1235.html', content, 'UTF-8');
	//$('.item__name .name__copytext').each((i, elem) => {
	$('.js_co_item').each((i, elem) => {
		if (i>9){
			return false;
		}
		//console.log(i);
		//console.log($(this).text()); // fail, arrow function & $(this) problem
		//console.log(elem['attribs']['title']);
		
		let $hotelInfo = cheerio.load($(elem).html());
		//console.log($hotelInfo('h2.name__copytext'));
		let name = $hotelInfo('h2.name__copytext').text().trim().replace(/\\/g, '');
		let price = $hotelInfo('.deal-other__more').text();
		price = parseInt( price.match(/\d+/g).join('') );
		
		let info = {
			name: name,
			price: price
		}
		
		hotels[i] = info;
		//console.log(name + ' ' + price);
	});
	
	hotels.sort((a, b) => {
		return a.price - b.price;
	});
	fs.writeFileSync('./trivago.txt', JSON.stringify(hotels), 'UTF-8');
	console.log(hotels);
}
