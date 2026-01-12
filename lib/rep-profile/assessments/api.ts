import api from '../client';

export const getPassage = async (language: string) => {
  try {
    const { data } = await api.get(`/assessments/passage?language=${language}`);
    return data;
  } catch (error: any) {
    console.error('Error fetching passage:', error);
    throw error.response?.data || error;
  }
};

export const uploadRecording = async (formData: FormData) => {
  try {
    // Note: Use proper headers for FormData usually handled by axios but need to check
    const { data } = await api.post('/assessments/upload-audio', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  } catch (error: any) {
    console.error('Error uploading recording:', error);
    throw error.response?.data || error;
  }
};

export const analyzeRecordingVertex = async (data: any) => {
  try {
    const { data: response } = await api.post('/assessments/analyze-audio', data);
    return response;
  } catch (error: any) {
    console.error('Error analyzing recording:', error);
    throw error.response?.data || error;
  }
};

