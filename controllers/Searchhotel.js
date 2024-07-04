
const { hotelPool } = require('../config/dbconfig');
const { geocodeAddress } = require('../middleware/geocodeAddress'); // Adjust path as per your project structure

// Function to calculate distance between two points using Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c; // Distance in kilometers
    return distance;
}

const fetchNearbyHotels = async (req, res) => {
    const { location } = req.query;

    try {
        // Geocode location to get latitude and longitude
        const { latitude, longitude } = await geocodeAddress(location);

        // If geocodeAddress returns null or undefined latitude and longitude
        if (!latitude || !longitude) {
            return res.status(404).json({ error: 'Location not found' });
        }

        // Fetch hotels within 50 kilometers
        const query = `
            SELECT * FROM hotel_list
            WHERE 
                SQRT(POW(69.1 * (latitude - ?), 2) + POW(69.1 * (? - longitude) * COS(latitude / 57.3), 2)) < 50
        `;
        const [hotels] = await hotelPool.query(query, [latitude, longitude]);

        // Calculate distance for each hotel and add it to the result
        const hotelsWithDistance = hotels.map(hotel => ({
            ...hotel,
            distance: calculateDistance(latitude, longitude, hotel.latitude, hotel.longitude)
        }));

        res.json({ hotels: hotelsWithDistance });
    } catch (error) {
        console.error('Error fetching nearby hotels:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = { fetchNearbyHotels, calculateDistance };
