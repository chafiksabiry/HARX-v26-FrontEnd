import axios from 'axios';
import Timezone from '../models/Timezone';
import dbConnect from '../lib/db/mongodb';

const IP_API_URL = 'http://ip-api.com/json/';

class IpInfoService {
  async getLocationInfo(ipAddress: string) {
    try {
      await dbConnect();
      
      // En développement ou si IP locale
      if (ipAddress === '127.0.0.1' || ipAddress === '::1' || ipAddress.startsWith('192.168.')) {
        return {
          region: 'Local',
          city: 'Localhost',
          isp: 'Local Development',
          timezone: 'UTC',
          countryCode: 'US' // Default fallback
        };
      }

      const response = await axios.get(`${IP_API_URL}${ipAddress}`);
      
      if (response.data.status === 'fail') {
        console.warn(`Failed to get location info for IP ${ipAddress}:`, response.data.message);
        return null;
      }

      return {
        region: response.data.regionName,
        city: response.data.city,
        isp: response.data.isp,
        postal: response.data.zip,
        coordinates: `${response.data.lat},${response.data.lon}`,
        timezone: response.data.timezone,
        countryCode: response.data.countryCode
      };
    } catch (error) {
      console.error('Error fetching IP info:', error);
      return null;
    }
  }
}

export default new IpInfoService();



