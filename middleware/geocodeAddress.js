const axios = require('axios');

const geocodeAddress = async (address) => {
    try {
        const response = await axios.get('https://nominatim.openstreetmap.org/search', {
            params: {
                q: address,
                format: 'json',
                limit: 1
            }
        });

        if (response.data.length > 0) {
            const { lat, lon } = response.data[0];
            return { latitude: parseFloat(lat), longitude: parseFloat(lon) };
        } else {
            throw new Error('No results found');
        }
    } catch (error) {
        console.error('Error geocoding address:', error);
        throw error;
    }
};

module.exports = {
    geocodeAddress
};
