import fetch from "node-fetch";

class CrawlingQueue {
    constructor(maxConcurrency) {
        this.maxConcurrency = maxConcurrency;
        this.running = 0; // Количество текущих выполняющихся задач
        this.queue = []; // Очередь задач
    }

    async add(task) {
        if (this.running < this.maxConcurrency) {
            this.execute(task);
        } else {
            this.queue.push(task);
        }
    }

    async execute(task) {
        this.running++;
        await task();
        this.running--;
        if (this.queue.length > 0) {
            this.execute(this.queue.shift());
        }
    }
}

export async function crawl(url, depth, concurrency) {
    const queue = [{val: url, ind: 0}];
    const visited = new Set();
    let crawled = [];
    const anchors = /<a\s[^>]*?href=(["']?)([^\s]+?)\1[^>]*?>/ig;
    const promises = Array(concurrency).fill(Promise.resolve());

    let num = 0;

    async function chainNext() {
        if (queue.length && num < concurrency) {
            num++;
            const arg = queue.shift();
            const links = [];

            const val = await fetch(arg.val)
            let txt = await val.text()
            txt.replace(anchors, function (_anchor, _quote, url) {
                if (!url.startsWith('/')) {
                    if (arg.ind + 1 <= depth && !visited.has(url)) {
                        queue.push({val: url, ind: arg.ind + 1});
                        visited.add(url);
                    }
                    links.push(url);
                }
            })
            crawled.push({url: arg.val, depth: arg.ind, content: txt, links: links})
            num--;
            await Promise.all(promises.map(chainNext));
        }
    }

    await Promise.all(promises.map(chainNext));
    return crawled;
}

// module.exports = crawl;
