const axios = require('axios');
const constants = require('../../config/constants.json');
const apiKeys = require('../../config/api_keys.json');

class DataFetcher {
    async fetchData(url) {
        const requestConfig = {
            headers: {
                cookie: constants.cookie.irr
            },
            method: 'GET',
            url: url,
            withCredentials: true,
        };

        return await axios(requestConfig);
    }

    async fetchGeocodingCoordinatesByLocation(location) {
        const requestConfig = {
            method: 'GET',
            url: 'https://maps.googleapis.com/maps/api/geocode/json',
            params: {
                address: location,
                key: apiKeys.geocoding
            },
        };

        return await axios(requestConfig);
    }
}

module.exports = new DataFetcher();
