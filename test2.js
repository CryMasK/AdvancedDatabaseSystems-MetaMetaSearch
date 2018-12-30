const phantom = require('phantom');
const cheerio = require('cheerio'); // CSS Selector
const fs = require('fs'); // FileStream

//let content;

async function a(){
	const instance = await phantom.create();
	const page = await instance.createPage();
	
	//const status = await page.open('https://www.tw.kayak.com/hotels/台北,台灣-c19888/2018-12-29/2018-12-30/2adults?sort=rank_a');
	const status = await page.open('https://www.hotelscombined.com.tw/Hotels/Search?destination=place:Taipei&checkin=2019-01-03&checkout=2019-01-04&Rooms=1&adults_1=2&currencyCode=TWD&languageCode=EN');
	await page.addCookie({
		name: 'Valid-Cookie-Name',
		value: 'Valid-Cookie-Value',
		domain: 'localhost',
		path: '/foo',
		httponly: true,
		secure: false,
		expires: new Date().getTime() + (1000 * 60 * 60)
	});
	let content = await page.property('content');
	
	let $ = cheerio.load(content); // load web
	fs.writeFileSync('./323.html', content, 'UTF-8');
	
	await instance.exit();
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
		//let price = 
	});
}
