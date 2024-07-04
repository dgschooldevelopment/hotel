const { hotelPool } = require('../config/dbconfig');

const bookHotel = async (req, res) => {
    const { hotel_list_id, user_id, check_in_date, check_out_date, total_no_of_rooms, total_no_of_guests, status } = req.body;

    // Set default status if not provided
    const bookingStatus = status || 'confirmed';

    // Validate all required fields
    if (!hotel_list_id || !user_id || !check_in_date || !check_out_date || !total_no_of_rooms || !total_no_of_guests) {
        return res.status(400).json({ error: 'All fields (hotel_list_id, user_id, check_in_date, check_out_date, total_no_of_rooms, total_no_of_guests) are required' });
    }

    try {
        // Fetch hotel information including total number of rooms and price per room
        const checkHotelQuery = `
            SELECT total_no_of_rooms, price_per_room FROM hotel_list WHERE hotel_id = ?
        `;
        const [hotelInfo] = await hotelPool.query(checkHotelQuery, [hotel_list_id]);

        if (hotelInfo.length === 0) {
            return res.status(404).json({ error: 'Hotel not found' });
        }

        const { total_no_of_rooms: hotelMaxRooms, price_per_room } = hotelInfo[0];

        // Check for overlapping bookings
        const checkBookingOverlapQuery = `
            SELECT SUM(total_no_of_rooms) as bookedRooms FROM book_hotel 
            WHERE hotel_list_id = ? AND 
                ((check_in_date <= ? AND check_out_date >= ?) OR (check_in_date <= ? AND check_out_date >= ?))
        `;
        const [overlappingBookings] = await hotelPool.query(checkBookingOverlapQuery, [hotel_list_id, check_out_date, check_in_date, check_out_date, check_in_date]);

        const bookedRooms = overlappingBookings[0]?.bookedRooms || 0;

        // Calculate the number of available rooms
        const availableRooms = hotelMaxRooms - bookedRooms;

        // Verify room availability based on overlapping bookings
        if (total_no_of_rooms > availableRooms) {
            return res.status(400).json({ error: `Not enough rooms available for the selected dates. Only ${availableRooms} rooms are available.` });
        }

        // Calculate total price based on the number of rooms and price per room
        const total_price = price_per_room * total_no_of_rooms;

        // Insert booking into the database
        const bookHotelQuery = `
            INSERT INTO book_hotel (hotel_list_id, user_id, check_in_date, check_out_date, total_no_of_rooms, total_no_of_guests, total_price, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const [result] = await hotelPool.query(bookHotelQuery, [hotel_list_id, user_id, check_in_date, check_out_date, total_no_of_rooms, total_no_of_guests, total_price, bookingStatus]);

        if (result.affectedRows === 1) {
            return res.status(201).json({ success: true, message: 'Hotel booked successfully', bookingStatus });
        } else {
            throw new Error('Failed to book hotel');
        }
    } catch (error) {
        console.error('Error booking hotel:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = { bookHotel };
