const { hotelPool } = require("../config/dbconfig");

const hotelList = async (req, res) => {
  try {
    const query = 'SELECT * FROM hotel_list';
    const [results] = await hotelPool.query(query);

    res.status(200).json(results);
  } catch (error) {
    console.error('Error executing query:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  hotelList
};
