import api from './api';

interface AddressData {
  businessName: string;
  streetAddress: string;
  locality: string;
  postalCode: string;
  countryCode: string;
  extendedAddress?: string;
  administrativeArea?: string;
  customerReference?: string;
}

interface AddressResponse {
  id: string;
  businessName: string;
  streetAddress: string;
  extendedAddress: string | null;
  locality: string;
  administrativeArea: string | null;
  postalCode: string;
  countryCode: string;
  customerReference: string | null;
  recordType: string;
  createdAt: string;
}

export const addressService = {
  async createAddress(data: AddressData): Promise<AddressResponse> {
    try {
      console.log('📫 Address service - data to send:', data);
      const response = await api.post<AddressResponse | { error: string; message: string }>(
        `/addresses`,
        data
      );
      
      // Check if response status indicates an error (422, 400, etc.)
      if (response.status >= 400) {
        console.error('❌ Response status indicates error:', response.status);
        console.error('❌ Response data:', JSON.stringify(response.data, null, 2));
        
        // Extract error message properly
        let errorMessage = 'Failed to create address';
        
        if (response.data && typeof response.data === 'object') {
          // Try to get message from response.data.message
          if ((response.data as any).message && typeof (response.data as any).message === 'string') {
            errorMessage = (response.data as any).message;
          } 
          // Try to get error from response.data.error
          else if ((response.data as any).error && typeof (response.data as any).error === 'string') {
            errorMessage = (response.data as any).error;
          }
          // If response.data itself is a string, use it
          else if (typeof response.data === 'string') {
            errorMessage = response.data;
          }
        }
        
        // Validate that errorMessage is not a concatenation of address fields
        // If it contains multiple commas and looks like address data, use a generic message
        if (errorMessage.includes(', ,') || errorMessage.split(',').length > 3) {
          console.warn('⚠️ Error message looks like concatenated address data, using generic message');
          errorMessage = 'Invalid address format. Please check that all address fields are correct and match the selected country.';
        }
        
        console.error('❌ Address creation error:', errorMessage);
        throw new Error(errorMessage);
      }
      
      // Check if response contains an error object
      if (response.data && typeof response.data === 'object' && 'error' in response.data) {
        const errorMessage = (response.data as any).message || 'Failed to create address';
        console.error('❌ Address creation error (error object):', errorMessage);
        throw new Error(errorMessage);
      }
      
      // Validate that we have an ID
      if (!(response.data as AddressResponse).id) {
        throw new Error('Failed to create address - no ID received');
      }
      
      console.log('✅ Address created successfully:', response.data);
      return response.data as AddressResponse;
    } catch (error: any) {
      console.error('❌ Error creating address:', error);
      
      // Extract error message from axios error response
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      if (error.message) {
        throw error;
      }
      throw new Error('Failed to create address');
    }
  }
};
