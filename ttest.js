let a = {"trivago":[{"name":"The Celestine Tokyo Shiba","price":7559},{"name":"The Celestine Ginza","price":11036},{"name":"Cerulean Tower Tokyu Hotel","price":15498},{"name":"The Strings By InterContinental","price":18122},{"name":"The Tokyo Station","price":19756},{"name":"InterContinental Hotel Tokyo Bay","price":23469},{"name":"InterContinental – ANA Tokyo","price":25625},{"name":"The Prince Gallery Tokyo Kioicho, a Luxury Collection Hotel","price":32878},{"name":"The Peninsula Tokyo","price":51232},{"name":"Oakwood Premier Tokyo","price":72355}],"hotelscombined":[{"name":"新宿王子大飯店","price":7340,"original_name":"Shinjuku Prince Hotel"},{"name":"第一東京酒店","price":12945,"original_name":"Daiichi Hotel Tokyo"},{"name":"東京皇家王子大飯店花園塔","price":18286,"original_name":"The Prince Park Tower Tokyo"},{"name":"東急澀谷藍塔大酒店","price":18414,"original_name":"Cerulean Tower Tokyu Hotel Tokyo"},{"name":"東京御臺場希爾頓酒店","price":19615,"original_name":"Hilton Tokyo Odaiba"},{"name":"東京希爾頓酒店","price":21467,"original_name":"Hilton Hotel Tokyo"},{"name":"東急凱彼德大酒店","price":24660,"original_name":"The Capitol Hotel Tokyu"},{"name":"東京全日空洲際飯店","price":25960,"original_name":"ANA InterContinental Tokyo"},{"name":"東京灣喜來登大酒店","price":27801,"original_name":"Sheraton Grande Tokyo Bay Hotel"},{"name":"東京半島酒店","price":51332,"original_name":"The Peninsula Hotel Tokyo"}],"kayak":[{"name":"東京丸之內雅詩閣飯店","price":16843,"original_name":"Ascott Marunouchi Tokyo"},{"name":"東京品川詩穎洲際飯店","price":18362,"original_name":"Intercontinental - Ana The Strings Tokyo"},{"name":"東急澀谷藍塔大飯店","price":18453,"original_name":"Cerulean Tower Tokyu Hotel"},{"name":"東京御台場希爾頓飯店","price":20872,"original_name":"Hilton Tokyo Odaiba"},{"name":"東京灣洲際飯店","price":21432,"original_name":"Intercontinental Hotels Tokyo Bay"},{"name":"東京希爾頓飯店","price":21520,"original_name":"Hilton Tokyo"},{"name":"東京全日空洲際飯店","price":23236,"original_name":"Intercontinental - Ana Tokyo"},{"name":"東急凱彼德大飯店","price":23980,"original_name":"The Capitol Hotel Tokyu"},{"name":"東京王子大飯店 - 豪華精選飯店","price":32866,"original_name":"The Prince Gallery Tokyo Kioicho, a Luxury Collection Hotel"},{"name":"東京香格里拉大飯店","price":61988,"original_name":"Shangri-La Hotel"}]};
b = a['trivago'].slice();
for (c in a){
  	continue;
	console.log(c)
}

console.log(a['trivago'])
console.log(b)

let pilot = 0;
function findFirstLargeNumber(elem, i) {
  if (elem['price'] < 8000){
    elem['price'] = 16000;
    pilot = i;
  }
      
  return elem['name'] == 'The Celestine Ginza';
}

index = b.findIndex(findFirstLargeNumber);

let tmp = b[index];
b[index] = b[pilot];
b[pilot] = tmp;
console.log(b)