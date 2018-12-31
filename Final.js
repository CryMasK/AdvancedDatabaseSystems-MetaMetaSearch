/* 呼叫的library */
const cheerio = require('cheerio'); // CSS Selector
const fs = require('fs'); // FileStream

const DATA_ID = 1;
const SEARCH_TARGET = ['台北', '台北', '東京', '東京']; // order by data id
const TARGET_SITE = ['trivago', 'hotelscombined', 'kayak'];
const RETRIEVE_LIMIT = 10;

const COMPARE_INTERVAL = 0.3; // in showInfo(), to determine how large price interval be used to compare

let raw_data = {};
let result = []; // our ranking
let duplicateHotels = []; // record duplicate hotel name within raw data

function crawlHotelInfo(site){
	let webPage = fs.readFileSync('./data-' + DATA_ID + '/' + site + '.html');
	
	let hotels = []; // store the result
	switch (site){
		case 'hotelscombined':{
			let $ = cheerio.load(webPage); // load web
			
			$('.hc-searchresultitem').each((i, elem) => {
				if (i >= RETRIEVE_LIMIT){
					return false; // break
				}
				
				let $hotelInfo = cheerio.load($(elem).html());
				
				/* Name */
				let name = $hotelInfo('.hc-searchresultitem__hotelnamelink').text().trim();
				let originalName = '';
				if ($hotelInfo('.hc-searchresultitem__transliteratedhotelname').length){ // for foreign hotel
					originalName = $hotelInfo('.hc-searchresultitem__transliteratedhotelname').text().trim();
				}
				
				/* Price */
				let price = -1;
				if ($hotelInfo('.hc-searchresultitemdeal__currentrate').length){
					price = $hotelInfo('.hc-searchresultitemdeal__currentrate').text();
					price = parseInt( price.match(/\d+/g).join('') ); // from string to int
				}
				else { // there is a member exclusive offer, we don't care about that
					$hotelInfo('.hc-searchresultitemdeal__roomrate').each((i, elem) => {
						let candidatePrice = $(elem).text();
						candidatePrice = parseInt( candidatePrice.match(/\d+/g).join('') ); // from string to int
						
						if (candidatePrice < price || price === -1){
							price = candidatePrice;
						}
					});
				}
				
				let info = {
					name: name,
					price: price
				}
				if (originalName){
					info['original_name'] = originalName;
				}
				
				hotels[i] = info; // store
			});
			
			break;
		}
			
		case 'kayak':{
			let $ = cheerio.load(webPage); // load web
			
			$('.Hotels-Results-HotelResultItem').each((i, elem) => {
				if (i >= RETRIEVE_LIMIT){
					return false; // break
				}
				
				let $hotelInfo = cheerio.load($(elem).html());
				/* Name */
				let name = $hotelInfo('.titleContainer').text().trim();
				let originalName = '';
				if ($hotelInfo('.localName').length){ // for foreign hotel
					originalName = $hotelInfo('.localName').text().trim();
				}
				
				/* Price */
				let price = $hotelInfo('div[id$="-booking-price"]').text();
				price = parseInt( price.match(/\d+/g).join('') );
				$hotelInfo('.inlineMultibook .price').each((i, elem) => {
					let candidatePrice = $(elem).text();
					candidatePrice = parseInt( candidatePrice.match(/\d+/g).join('') ); // from string to int
					
					if (candidatePrice < price){
						price = candidatePrice;
					}
				});
				
				let info = {
					name: name,
					price: price
				}
				if (originalName){
					info['original_name'] = originalName;
				}
				
				hotels[i] = info; // store
			});
			
			break;
		}
			
		case 'trivago':{
			let $ = cheerio.load(webPage); // load web
			
			$('.js_co_item').each((i, elem) => {
				if (i >= RETRIEVE_LIMIT){
					return false; // break
				}
				
				let $hotelInfo = cheerio.load($(elem).html());
				
				/* Name */
				let name = $hotelInfo('h2.name__copytext').text().trim();
				
				/* Price */
				let price = $hotelInfo('.deal-other__more').text();
				price = parseInt( price.match(/\d+/g).join('') );
				
				let info = {
					name: name,
					price: price
				}
				
				hotels[i] = info; // store
			});
			
			break;
		}
		
		default:
			console.log('沒這種東西');
			break;
	}
	
	hotels.sort((a, b) => { // sort by price
		return a.price - b.price;
	});
	raw_data[site] = hotels;
}

function showInfo(raw = raw_data, ours = result){ // Object, Array
	/* Show result length */
	let avgLongerThan = 0; // record how our result longer(diversity) than each meta-search provider(%)
	
	for (let site of TARGET_SITE){
		console.log(site + "'s length: " + raw[site].length);
		
		avgLongerThan += (ours.length - raw[site].length) / raw[site].length;
	}
	avgLongerThan /= TARGET_SITE.length;
	
	console.log('Our ranking result length: ' + ours.length);
	
	/* Show the difference between our lowest/highest price and the average of lowest/highest price from each result */
	// the lowest/highest price
	let avgLowestPrice = 0,
		avgLowestPriceRatio = 0,
		avgHighestPrice = 0,
		avgHighestPriceRatio = 0;
		
	for (let site in raw){
		avgLowestPrice += raw[site][0]['price'];
		avgLowestPriceRatio += (ours[0]['price'] - raw[site][0]['price']) / raw[site][0]['price'];
		avgHighestPrice += raw[site][raw[site].length - 1]['price'];
		avgHighestPriceRatio += (ours[ours.length -1]['price'] - raw[site][raw[site].length - 1]['price']) / raw[site][raw[site].length - 1]['price'];
	}
	avgLowestPrice /= TARGET_SITE.length;
	avgLowestPriceRatio /= TARGET_SITE.length;
	avgHighestPrice /= TARGET_SITE.length;
	avgHighestPriceRatio /= TARGET_SITE.length;
	
	// the TopK/LastK price
	let avgLowIntervalPrice = 0,
		avgLowIntervalPriceRatio = 0,
		avgHighIntervalPrice = 0,
		avgHighIntervalPriceRatio = 0;
	let ourAvgTopKPrice = 0,
		ourAvgLastKPrice = 0;
	
	// compute the average of our result TopK/LastK price
	let ourTopK = Math.floor(ours.length * COMPARE_INTERVAL);
	for (let i=0; i<ourTopK; i++){
		ourAvgTopKPrice += ours[i]['price'];
	}
	ourAvgTopKPrice /= ourTopK;
	for (let i=ours.length - ourTopK; i<ours.length; i++){
		ourAvgLastKPrice += ours[i]['price'];
	}
	ourAvgLastKPrice /= ourTopK;
		
	for (let site in raw){
		let topK = Math.floor(raw[site].length * COMPARE_INTERVAL);
		
		let lowIntervalPrice = 0;
		for (let i=0; i<topK; i++){
			lowIntervalPrice += raw[site][i]['price'];
		}
		lowIntervalPrice /= topK;
		avgLowIntervalPrice += lowIntervalPrice;
		avgLowIntervalPriceRatio += (ourAvgTopKPrice - lowIntervalPrice) / lowIntervalPrice;
		
		let highIntervalPrice = 0;
		for (let i=raw[site].length - topK; i<raw[site].length; i++){
			highIntervalPrice += raw[site][i]['price'];
		}
		highIntervalPrice /= topK;
		avgHighIntervalPrice += highIntervalPrice;
		avgHighIntervalPriceRatio += (ourAvgLastKPrice - highIntervalPrice) / highIntervalPrice;
	}
	avgLowIntervalPrice /= TARGET_SITE.length;
	avgLowIntervalPriceRatio /= TARGET_SITE.length;
	avgHighIntervalPrice /= TARGET_SITE.length;
	avgHighIntervalPriceRatio /= TARGET_SITE.length;
	
	console.log('與「最低價物件平均」相差: ' + (ours[0]['price'] - avgLowestPrice));
	console.log('與「最低價物件」平均相差比例: ' + (avgLowestPriceRatio * 100) + '%');
	console.log('與「低價物件（前' + (COMPARE_INTERVAL * 100) +'%平均）平均」相差: ' + (ourAvgTopKPrice - avgLowIntervalPrice));
	console.log('與「低價物件（前' + (COMPARE_INTERVAL * 100) +'%平均）」平均相差比例: ' + (avgLowIntervalPriceRatio * 100) + '%');
	console.log('與「最高價物件平均」相差: ' + (ours[ours.length - 1]['price'] - avgHighestPrice));
	console.log('與「最高價物件」平均相差比例: ' + (avgHighestPriceRatio * 100) + '%');
	console.log('與「高價物件（後' + (COMPARE_INTERVAL * 100) +'%平均）平均」相差: ' + (ourAvgLastKPrice - avgHighIntervalPrice));
	console.log('與「高價物件（後' + (COMPARE_INTERVAL * 100) +'%平均）」平均相差比例: ' + (avgHighIntervalPriceRatio * 100) + '%');
	
	console.log('我們的結果數量平均多上(多樣性): ' + (avgLongerThan * 100) + '%');
	
	/*  */
	let avgSavingMoney = 0; // record the average of saving percentage
	
	let saveCounter = 0, // record how many hotel item we get more cheaper result
		saveProvider = {}; // record how many hotel item we get more cheaper result from each meta-search provider
	
	let regex = new RegExp('^' + SEARCH_TARGET[ DATA_ID - 1 ]);
	if (typeof duplicateHotels !== typeof undefined){
		for (let hotel of duplicateHotels){
			let overpayResult = [],
				minPriceResult = [];
			
			let ourMatchIndex = ours.findIndex(x => x['name'].replace(regex, '') == hotel['name'].replace(regex, ''));
			for (let site in raw){
				let arr = raw[site];
				
				let duplicateMatchIndex = arr.findIndex(x => x['name'].replace(regex, '') == hotel['name'].replace(regex, '') || x['name'] == hotel['original_name'] || (x['original_name'] && (x['original_name'] == hotel['original_name'] || x['original_name'] == hotel['name'])) );
				if (duplicateMatchIndex != -1){ // this site's raw data has duplicate result
					//console.log(arr[ duplicateMatchIndex ]);
					//console.log(ourMatchIndex);
					if (arr[ duplicateMatchIndex ]['price'] > ours[ ourMatchIndex ]['price']){
						overpayResult.push(site);
						
						avgSavingMoney += (arr[duplicateMatchIndex]['price'] - ours[ourMatchIndex]['price']) / arr[duplicateMatchIndex]['price'];
					}
					else {
						minPriceResult.push(site);
					}
				}
			}
			
			if (overpayResult.length > 0){
				avgSavingMoney /= overpayResult.length;
				
				saveCounter ++; // count how many hotel item we get more cheaper result
				
				for (provider of minPriceResult){ // count which site provide us the cheapest result
					if (saveProvider[provider]){
						saveProvider[provider] ++;
					}
					else {
						saveProvider[provider] = 1;
					}
				}
			}
			/*else {
				console.log(hotel)
			}*/
		}
		avgSavingMoney /= saveCounter;
		
		console.log('用我們的結果，平均省下: ' + (avgSavingMoney * 100) + '%');
		
		console.log('有幾個飯店物件在我們的結果找到更便宜的價錢: ' + saveCounter);
		for (site of TARGET_SITE){
			console.log('在' + site + '取得最便宜的件數: ' + (saveProvider[site] ? saveProvider[site] : 0));
		}
	}
	else {
		// for modular situation
	}
}

function main(){
	/* Process data */
	for (let site of TARGET_SITE){
		crawlHotelInfo(site);
	}
	fs.writeFileSync('./data-' + DATA_ID + '/raw.txt' , JSON.stringify(raw_data), 'UTF-8');
	
	/* Create our result */
	let regex = new RegExp('^' + SEARCH_TARGET[ DATA_ID - 1 ]);
	for (let key in raw_data){
		if (result.length === 0){ // first time
			result = JSON.parse(JSON.stringify( raw_data[key].slice() )); // initialize
			continue;
		}
		
		for (let hotel of raw_data[key]){
			let pricePilot = -1;
			
			let hotelIndex = result.findIndex((elem, i) => {
				if (elem['price'] <= hotel['price']){ // record where the hotel position should be in the same time	/* Use equal sign because we want to use 'pricePilot' & 'hotelIndex' to decide whether to adjust the position in the following */
					pricePilot = i;
				}
				
				if ( elem['name'].replace(regex, '') == hotel['name'].replace(regex, '') || elem['name'] == hotel['original_name'] || (elem['original_name'] && (elem['original_name'] == hotel['original_name'] || elem['original_name'] == hotel['name'])) ){
					if (hotel['price'] < elem['price']){ // new price info is cheaper than the old one 
						elem['price'] = hotel['price']; // update
					}
					
					if (!elem['original_name'] && hotel['original_name']){ // our result doesn't have hotel original name, but other result has
						elem['original_name'] = hotel['original_name']; // add 
					}
					
					if (elem['name'] == hotel['original_name']){ // our result name equal to raw data original name (it means that the name is actually the original name)
						let i = duplicateHotels.findIndex(x => x['name'] == elem['name']);
						if (i != -1){ // found a wrong record
							duplicateHotels[i]['name'] = hotel['name']; // correct the recode
						}
						elem['name'] = hotel['name']; // correct
					}
					
					if (!duplicateHotels.some( x => x['name'] == elem['name'] )){ // found a duplicate result and didn't record before
						let duplicate = {name: elem['name']};
						if (elem['original_name']){
							duplicate['original_name'] = elem['original_name'];
						}
						duplicateHotels.push(duplicate); // record
					}
					else {
						let i = duplicateHotels.findIndex(x => x['name'] == elem['name'] && elem['original_name'] && !x['original_name']);
						if (i != -1){ // record didn't recode original name
							duplicateHotels[i]['original_name'] = elem['name']; // add original name to recode
						}
					}
					return true;
				}
			});
			
			/* We don't care about the prefix of hotel name, it store name with/without location prefix base on its sequence */
			if (hotelIndex == -1){ // new hotel
				result.splice( pricePilot + 1, 0, JSON.parse(JSON.stringify(hotel)) ); // insert after the pilot
			}
			else { // price been updated or price not cheaper than the former
				if (pricePilot != hotelIndex){ // if updated and the position need to change forward
					result.splice(pricePilot + 1, 0, result.splice(hotelIndex, 1)[0]); // move to the end of pilot
				}
			}
		}
	}
	//console.log(duplicateHotels);
	//console.log(raw_data)
	showInfo();
	fs.writeFileSync('./data-' + DATA_ID + '/result.txt' , JSON.stringify(result), 'UTF-8');
}

main();