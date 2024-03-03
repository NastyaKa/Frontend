// Определение глобального метода fetch
// global.fetch = require('node-fetch');
//
// const crawl = require('./crawl');

import fetch from "node-fetch";
import {crawl} from './crawl.js'

// Пример запуска функции crawl:
(async () => {
    const startingUrl = 'https://example.com';
    const depth = 1;
    const concurrency = 5;

    const result = await crawl(startingUrl, depth, concurrency);
    console.log(result);
})();