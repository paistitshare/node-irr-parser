const cheerio = require('cheerio');
const moment = require('moment');

class DataParser {
    parsePosts(fetchedData, postsNumber) {
        const $ = cheerio.load(fetchedData);
        const postBlocks = $('.add_list').slice(0, postsNumber);

        const postsData = $(postBlocks).map((i, postBlock) => {
            const postTitleAnchor = $(postBlock).find('.add_title');
            const title = $(postTitleAnchor).text().trim();
            const price = Number.parseInt($(postBlock).find('.add_cost_alt').first().text().trim());
            const createdAt = moment($(postBlock).find('.add_data').text().trim(), 'hh:mm, DD.MM.YYYY').format();
            const postUrl = $(postTitleAnchor).attr('href');

            return {
                title,
                postUrl,
                price,
                createdAt
            };
        }).toArray();

        return postsData;
    }

    parsePost(fetchedData) {
        const $ = cheerio.load(fetchedData);

        const description = $('.content_left').find('.text').text();
        const location = $('.content_left').find('.address_link').text();

        return {
           description,
           location,
        }
   }
}

module.exports = new DataParser();
