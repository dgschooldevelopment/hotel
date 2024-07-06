const { hotelPool } = require("../config/dbconfig");

const hotelList = async (req, res) => {
  try {
    // Query to fetch hotel list data and their associated images
    const query = `
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
        hi.image_id,
        hi.image_url,
        hi.image_description,
        hi.image
      FROM 
        hotel_list hl
      LEFT JOIN 
        hotel_images hi 
      ON 
        hl.hotel_id = hi.hotel_id
    `;

    const [results] = await hotelPool.query(query);

    // Process the results to group images under their respective hotels
    const hotels = results.reduce((acc, row) => {
      const hotel = acc.find(h => h.hotel_id === row.hotel_id);
      if (hotel) {
        hotel.images.push({
          image_id: row.image_id,
          image_url: row.image_url,
          image_description: row.image_description,
          image: row.image ? row.image.toString('base64') : null,
        });
      } else {
        acc.push({
          hotel_id: row.hotel_id,
          name: row.name,
          total_no_of_guests: row.total_no_of_guests,
          total_no_of_rooms: row.total_no_of_rooms,
          type_of_accommodation: row.type_of_accommodation,
          location: row.location,
          price_per_room: row.price_per_room,
          about: row.about,
          policy_rules: row.policy_rules,
          facilities: row.facilities,
          FAQ: row.FAQ,
          locationcodeaddress: row.locationcodeaddress,
          home_rules_and_truths: row.home_rules_and_truths,
          villa_id: row.villa_id,
          Amenities: row.Amenities,
          images: row.image_id ? [{
            image_id: row.image_id,
            image_url: row.image_url,
            image_description: row.image_description,
            image: row.image ? row.image.toString('base64') : null,
          }] : []
        });
      }
      return acc;
    }, []);

    res.status(200).json(hotels);
  } catch (error) {
    console.error('Error executing query:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  hotelList
};
