import axios from 'axios';
import validator from 'validator';

/**
 * Convert address to coordinates using LocationIQ API
 * @param {Object} address - Address object with street, number, city
 * @returns {Object} Coordinates object with lat and lon
 */
export default async function getCoordinates(address) {

  try {

    const response = await axios.get(`https://us1.locationiq.com/v1/search`, {
      params: {
        key: process.env.LOCATIONIQ_API_KEY,
        q: address,
        format: 'json',
        limit: 1
      }
    });

    // Returns first result
    if (response.data && response.data.length > 0) {

      return {
        lat: parseFloat(response.data[0].lat),
        lon: parseFloat(response.data[0].lon)
      };
    }

    return null;

  } catch (error) {

    console.error('Error getting coordinates:', error);
    return null;
  }
}
