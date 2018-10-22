const dataFetcher = require('./DataFetcher');
const dataPersister = require('./DataPersister');
const dataParser = require('./DataParser');
const constants = require('../../config/constants.json');
const calculatePages = require('./PageCalculator');
const mongoose = require('mongoose');

class RealEstateProcessor {
    async process(postsNumber = 50) {
        const pagesToFetch = calculatePages(postsNumber);
        let parsedPosts = [];

        mongoose.connect(constants.uri.mongodb, {
            useCreateIndex: true,
            useNewUrlParser: true
        });

        for (let i = 1; i <= pagesToFetch; i++) {
            const realEstateUrl = constants.uri.irr.realEstate + 'list=list/page_len60/page' + i;
            const response = await dataFetcher.fetchData(realEstateUrl);
            const posts = dataParser.parsePosts(response.data, postsNumber)

            parsedPosts = parsedPosts.concat(posts);
        }

        parsedPosts.map(async (parsedPost) => {
            const response = await dataFetcher.fetchData(parsedPost.postUrl);

            parsedPost = Object.assign(parsedPost, dataParser.parsePost(response.data));

            parsedPost.location = await this.getGeoCoordinatesByLocation(parsedPost.location);

            dataPersister.persist(parsedPost);
        });
    }

    async getGeoCoordinatesByLocation(location) {
        const geoApiLocationData = await dataFetcher.fetchGeocodingCoordinatesByLocation(location);
        const coordinates = geoApiLocationData.data.results[0].geometry.location;

        return {
            type: "Point",
            coordinates: [
                coordinates.lng,
                coordinates.lat
            ]
        };
    }
}

module.exports = new RealEstateProcessor();
