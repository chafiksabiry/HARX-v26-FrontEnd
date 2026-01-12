import api from './api';

interface DocumentUploadResponse {
  id: string;
  filename: string;
  size: {
    unit: string;
    amount: number;
  } | number;
  sha256: string;
  status: string;
  content_type: string;
  customerReference?: string;
  createdAt: string;
}

export const documentService = {
  async uploadDocument(
    file: File,
    filename?: string,
    customerReference?: string
  ): Promise<DocumentUploadResponse> {
    try {
      console.log('📄 Uploading document:', { filename: file.name, size: file.size });
      
      const formData = new FormData();
      formData.append('file', file); // Le nom du champ doit correspondre à ce que multer attend
      
      if (filename) {
        formData.append('filename', filename);
      }
      
      if (customerReference) {
        formData.append('customer_reference', customerReference);
      }

      const response = await api.post<DocumentUploadResponse>(
        `/documents`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      console.log('✅ Document uploaded successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error uploading document:', error);
      throw error;
    }
  }
};
