/*const { hotelPool } = require('../config/dbconfig');
const { geocodeAddress } = require('../middleware/geocodeAddress');

const searchHotels = async (req, res) => {
    const { check_in_date, check_out_date, total_no_of_rooms, location } = req.query;

    try {
        // Parse number of rooms to integer
        const rooms = parseInt(total_no_of_rooms);

        // Validate parsed values
        
        if (isNaN(rooms)) {
            return res.status(400).json({ error: 'Invalid number of rooms' });
        }

        const checkInDate = new Date(check_in_date);
        const checkOutDate = new Date(check_out_date);

        if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
            return res.status(400).json({ error: 'Invalid check-in or check-out date' });
        }

        // Geocode the address to get latitude and longitude if location is provided
        let latitude, longitude;
        if (location) {
            const { latitude: locLatitude, longitude: locLongitude } = await geocodeAddress(location);
            latitude = locLatitude;
            longitude = locLongitude;
        }

        // Build the base query to fetch hotels based on availability and optionally location
        let searchQuery = `
            SELECT
                hl.hotel_id,
                hl.name,
                hl.total_no_of_guests,
                hl.total_no_of_rooms,
                hl.type_of_accommodation,
                hl.location,
                hl.price_per_room,     


                hl.meals,
                hl.experience,
                hl.home_rules_and_truths,
                hl.latitude,
                hl.longitude,
                hl.price_per_room * ? as total_price,
                ( 6371 * acos( cos( radians(?) ) * cos( radians( hl.latitude ) ) * cos( radians( hl.longitude ) - radians(?) ) + sin( radians(?) ) * sin( radians( hl.latitude ) ) ) ) AS distance
            FROM
                hotel_list hl
            LEFT JOIN (
                SELECT
                    hotel_list_id,
                    SUM(total_no_of_rooms) AS booked_rooms
                FROM
                    book_hotel
                WHERE
                    (check_in_date <= ? AND check_out_date > ?)
                    OR (check_in_date < ? AND check_out_date >= ?)
                GROUP BY
                    hotel_list_id
            ) AS bh ON hl.hotel_id = bh.hotel_list_id
            WHERE
                (hl.total_no_of_rooms - COALESCE(booked_rooms, 0)) >= ?
        `;

        const params = [
            rooms,
            latitude,
            longitude,
            latitude,
            check_out_date,
            check_in_date,
            check_out_date,
            check_in_date,
            rooms
        ];

        // If latitude and longitude are provided, include location-based filtering and distance calculation
        if (latitude && longitude) {
            searchQuery += `
                HAVING distance <= 50
                ORDER BY distance ASC, total_price ASC
            `;
        } else {
            // If location is not provided, order by total price and room availability
            searchQuery += `
                ORDER BY total_price ASC
            `;
        }

        // Execute the main query to fetch hotels
        const [hotels] = await hotelPool.query(searchQuery, params);

        // Fetch images for each hotel found
        for (let hotel of hotels) {
            const fetchImagesQuery = `
                SELECT
                    image_id,
                    hotel_id,
                    image_url,
                    image_description
                FROM
                    hotel_images
                WHERE
                    hotel_id = ?
            `;
            const [images] = await hotelPool.query(fetchImagesQuery, [hotel.hotel_id]);
            hotel.images = images; // Attach images to the hotel object
        }

        res.status(200).json({ success: true, hotels });
    } catch (error) {
        console.error('Error searching hotels:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    searchHotels
};
*/
const { hotelPool } = require('../config/dbconfig');
const { geocodeAddress } = require('../middleware/geocodeAddress');

const searchHotels = async (req, res) => {
    const { check_in_date, check_out_date, total_no_of_rooms, location } = req.query;

    try {
        // Parse number of rooms to integer
        const rooms = parseInt(total_no_of_rooms);

        // Validate parsed values
        if (isNaN(rooms)) {
            return res.status(400).json({ error: 'Invalid number of rooms' });
        }

        const checkInDate = new Date(check_in_date);
        const checkOutDate = new Date(check_out_date);

        if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
            return res.status(400).json({ error: 'Invalid check-in or check-out date' });
        }

        // Geocode the address to get latitude and longitude if location is provided
        let latitude, longitude;
        if (location) {
            const { latitude: locLatitude, longitude: locLongitude } = await geocodeAddress(location);
            latitude = locLatitude;
            longitude = locLongitude;
        }

        // Build the base query to fetch hotels based on availability and optionally location
        let searchQuery = `
            SELECT
                hl.hotel_id,
                hl.name,
                hl.total_no_of_guests,
                hl.total_no_of_rooms,
                hl.type_of_accommodation,
                hl.location,
                hl.price_per_room,
                hl.about,
                hl.policy_rules,
                hl.facilities,
                hl.FAQ,
                hl.locationcodeaddress AS locationcodeaddress,
                hl.home_rules_and_truths,
                hl.villa_id,
                hl.Amenities,
                hl.price_per_room * ? AS total_price,
                (6371 * acos(cos(radians(19.092952)) * cos(radians(JSON_UNQUOTE(JSON_EXTRACT(hl.locationcodeaddress, '$.latitude')))) * cos(radians(JSON_UNQUOTE(JSON_EXTRACT(hl.locationcodeaddress, '$.longitude'))) - radians(74.7493451)) + sin(radians(19.092952)) * sin(radians(JSON_UNQUOTE(JSON_EXTRACT(hl.locationcodeaddress, '$.latitude')))))) AS distance
            FROM
                hotel_list hl
            LEFT JOIN (
                SELECT
                    hotel_list_id,
                    SUM(total_no_of_rooms) AS booked_rooms
                FROM
                    book_hotel
                WHERE
                    (check_in_date <= ? AND check_out_date > ?)
                    OR (check_in_date < ? AND check_out_date >= ?)
                GROUP BY
                    hotel_list_id
            ) AS bh ON hl.hotel_id = bh.hotel_list_id
            WHERE
                (hl.total_no_of_rooms - COALESCE(booked_rooms, 0)) >= ?
        `;

        const params = [
            rooms,
            check_out_date,
            check_in_date,
            check_out_date,
            check_in_date,
            rooms
        ];

        // If latitude and longitude are provided, include location-based filtering and distance calculation
        if (latitude && longitude) {
            searchQuery += `
                HAVING distance <= 50
                ORDER BY distance ASC, total_price ASC
            `;
        } else {
            // If location is not provided, order by total price and room availability
            searchQuery += `
                ORDER BY total_price ASC
            `;
        }

        // Execute the main query to fetch hotels
        const [hotels] = await hotelPool.query(searchQuery, params);

        // Fetch images for each hotel found
        for (let hotel of hotels) {
            const fetchImagesQuery = `
                SELECT
                    image_id,
                    hotel_id,
                    image_url,
                    image_description
                FROM
                    hotel_images
                WHERE
                    hotel_id = ?
            `;
            const [images] = await hotelPool.query(fetchImagesQuery, [hotel.hotel_id]);
            hotel.images = images; // Attach images to the hotel object
        }

        res.status(200).json({ success: true, hotels });
    } catch (error) {
        console.error('Error searching hotels:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    searchHotels
};
