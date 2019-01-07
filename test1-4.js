/* 呼叫的library */
const cheerio = require('cheerio'); // CSS Selector
const fs = require('fs'); // FileStream

let webPage = fs.readFileSync('./data-11/trivago.html');

let $ = cheerio.load(webPage); // load web

console.log($('li.itemlist_error_wrapper').index());