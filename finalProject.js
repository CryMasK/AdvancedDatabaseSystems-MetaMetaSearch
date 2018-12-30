/* 呼叫的library */
const request = require('request'); // HTTP Request
const cheerio = require('cheerio'); // CSS Selector
const fs = require('fs'); // FileStream

const RETRY_DELAY = 3000;

//const targetUrl = ['https://www.trivago.com.tw/?aDateRange%5Barr%5D=2019-01-01&aDateRange%5Bdep%5D=2019-01-02&aPriceRange%5Bfrom%5D=0&aPriceRange%5Bto%5D=0&iPathId=92368&aGeoCode%5Blat%5D=25.085405&aGeoCode%5Blng%5D=121.561501&iGeoDistanceItem=0'];
const targetUrl = ['https://www.hotelscombined.com.tw/Hotels/Search?destination=place:Taipei&checkin=2019-01-03&checkout=2019-01-04&Rooms=1&adults_1=2&currencyCode=TWD&languageCode=EN'];

let raw_data = {};

function delay(ms){
	return new Promise(function(resolve, reject){
		setTimeout(resolve, ms);
	});
}

function retrieveDomainName(url){ // return only top-level domain(eg. 'www.google.com.tw' will return 'google').
	let domain = url.match(/^(?:.*?:\/\/|\/\/)?(?:www\.)?([\w-]+)/)[1]; // not handle special UrlPrefix(only "www")
	
	let specialCase = ['jp', 'de', 'old', 'm', 'flashservice', 'player', 'souko', 'drive', 'video', 'embed', 'tw']; // for some url has subdomain or language code
	if ( specialCase.includes(domain) ){
		domain = url.match(/^(?:.*?:\/\/|\/\/)?(?:www\.)?(?:[\w-]+).([\w-]+)/)[1]; // get second position of domain
		
		/*if (config.DebugMode){
			console.log('Found a special URL when retrieve domain name(' + domain + ' - ' + url + ').'); //message
		}*/
		return domain;
	}
	else {
		return domain;
	}
}

function crawlHotelInfo(url){
	let site = retrieveDomainName(url);	
	
	let hotels = []; // store the result
	return new Promise( async (resolve, reject) => {
		const instance = await phantom.create();
		const page = await instance.createPage();
		
		const status = await page.open(url);
		
		switch (site){
			case 'hotelscombined':{
				fs.writeFileSync('./223.html', web);
				let $ = cheerio.load(web); // load web
				console.log($('.hc-searchresultitem').length);
				
				break;
			}
			
			case 'trivago':{
				let content = await page.property('content');
				
				let $ = cheerio.load(content); // load web
				while ( !$('h2.name__copytext').length ){ // not the template that we want				
					// reload the page
					await delay(RETRY_DELAY);
					await page.reload();
					content = await page.property('content');
					$ = cheerio.load(content);
				}
				
				$('.js_co_item').each((i, elem) => {	
					let $hotelInfo = cheerio.load($(elem).html());
					
					let name = $hotelInfo('h2.name__copytext').text().trim().replace(/\\/g, '');
					let price = $hotelInfo('.deal-other__more').text();
					price = parseInt( price.match(/\d+/g).join('') );
					
					let info = {
						name: name,
						price: price
					}
					
					hotels[i] = info;
				});
				
				break;
			}
			
			default:
				console.log('你在跟我開玩笑？');
				break;
		}
		
		hotels.sort((a, b) => { // sort by price
			return a.price - b.price;
		});
		raw_data[site] = hotels;
		resolve();
	});
}

function Deprecated_crawlHotelInfo(url){
	let site = retrieveDomainName(url);
	
	headersT = {
		'Host': 'www.trivago.com.tw',
		'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64; rv:64.0) Gecko/20100101 Firefox/64.0',
		'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
		'Accept-Language': 'zh-TW,zh;q=0.8,en-US;q=0.5,en;q=0.3',
		'Accept-Encoding': 'gzip, deflate, br',
		'DNT': '1',
		'Connection': 'keep-alive',
		'Cookie': 'PHPSESSID=b4d4485de854656a8c5180a075225db2; sLanguageLocale=TW; ftv=%7B%22ftv%22%3A%2220181224010442%22%2C%22ltv%22%3A%2220181224010442%22%2C%22ep%22%3A1000%2C%22cntv%22%3A1%2C%22cntc%22%3A0%2C%22cntcs%22%3A0%2C%22fep%22%3A1000%2C%22vc%22%3A0%2C%22ctl%22%3A999%2C%22ctf%22%3A999%2C%22item%22%3A0%2C%22path%22%3A92368%2C%22path2%22%3A92368%7D; bookmarks_token=2qSFsOvvCVKkAx6I4N3jw82bkmeHHTMKswtaib5Lpp4; tid=CD70POe19m5VUM27pPIvU362ZO; trv_tid=CD70POe19m5VUM27pPIvU362ZO; GROUP=nsi; trv_cal_int=true',
		'Upgrade-Insecure-Requests': '1'
	}
	
	headersH = {
		'Host': 'www.hotelscombined.com',
		'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:64.0) Gecko/20100101 Firefox/64.0',
		'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
		'Accept-Language': 'en-US;q=0.8,en;q=0.3',
		'Accept-Encoding': 'gzip, deflate, br',
		'DNT': '1',
		'Connection': 'keep-alive',
		'Cookie': 'a_aid=400; countryCode=US; languageCode=US; currencyCode=TWD; dcid=dal05; __RequestVerificationToken=OONityLsS8h79AJIKA5y9LzkGyCrw4aeJ-YAd42T8QD9mALPSvY1dTziMzSZhhU6d1Ku8h5azskntISK9qlSrfv1exE1; Tests=D419000901000A1101B21101C31001C71001CE1001FB1001FE01020001020400020510020710D496; visit=date=2018-12-28T07:22:24.5767828+11:00&id=de0c9d51-9f6c-4701-b299-df982a8172cd; visitor=id=ec589e64-c841-4a8c-8c6f-f09143bbc77e&tracked=true; Analytics=LandingID=&LanguageCode=TW&WebPageID=4; googleAnalytics=%7B%22registration%22%3A%7B%22type%22%3A%22standard%22%7D%7D; ksession=k; _pxvid=1fd3b570-0a15-11e9-9abb-f7613dd18e92; _px=/eFpL0MMOXfbecpxkT5SoDngNCOivuS/F1hoUhUy3mQYHdiRzNNYwgGEVWGmTbTkgZNiO82cM7nlVpVYcFwz3Q==:1000:zqTK5xv+aN6vzulHh7xCKhhyGQrH7xfhn056xX+jWt6HGHJLPpkJ3dfpztef/M87uucEYfqZeFntVmqovj91uydLbYPLk7KU1j7+AzvS/4LbU/3uqQB9m6aaKxxzVLxOn9LJnSAxMm44hn9+LXJRUgzQw1A1czqRTY+JL69hs+gwwnNzPz1r37uTxBwmbXo+4U8ACd6yQse0X8/EtsV31mdekGqq7GrDzgfz8EQTs1t8YDeG0pk92K9uFY3e9mbIEAJenE10iGLBfuPVPT0EgQ==; search=place:Taipei#20190103#20190104#2; SearchHistory=Taipei%20190103%20190104%2%TWD%%7#',
		'Upgrade-Insecure-Requests': '1'
	}
	
	return new Promise( (resolve, reject) => {
		request({
		url: url,
		headers: headersH,
		method: "GET"
		}, (error, res, web) => {
			if (error || !web){ // error section
				console.log(crawlHotelInfo.name + " - Failed due to: " + error);
				reject(error);
			}
			else { // task section
				switch (site){
					/*case 'agoda':{
						break;
					}*/
					
					case 'hotelscombined':{
						fs.writeFileSync('./223.html', web);
						let $ = cheerio.load(web); // load web
						console.log($('.hc-searchresultitem').length);
						console.log(res);
						break;
					}
					
					case 'trivago':{
						let $ = cheerio.load(web); // load web
						//console.log(web)
						$('.hotel-item h3 .item-link').each((i, elem) => {
							console.log($(this).attr('title'));
							console.log(87)
						});
						
						break;
					}
					
					default:
						console.log('你在跟我開玩笑？');
						break;
				}
			}
		});
	});
}

async function main(){
	const crawlingPromise = [];
	
	for (url of targetUrl){
		crawlingPromise.push( crawlHotelInfo(url) );
	}
	
	await Promise.all(crawlingPromise);
}

main();