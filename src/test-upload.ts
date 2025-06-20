import fs from 'fs';
import path from 'path';
import axios, { AxiosError } from 'axios';
import FormData from 'form-data';

const API_URL = 'http://localhost:5000/api';

async function testUpload() {
  try {
    // Create a test image file
    const testImagePath = path.join(__dirname, 'test-image.jpg');
    const imageBuffer = Buffer.from('fake image data');
    fs.writeFileSync(testImagePath, imageBuffer);

    // Test upload
    console.log('Testing file upload...');
    const formData = new FormData();
    formData.append('file', imageBuffer, {
      filename: 'test-image.jpg',
      contentType: 'image/jpeg'
    });

    const uploadResponse = await axios.post(`${API_URL}/upload/test`, formData, {
      headers: {
        ...formData.getHeaders()
      },
    });

    console.log('Upload response:', uploadResponse.data);
    const fileUrl = uploadResponse.data.fileUrl;

    // Test delete
    console.log('\nTesting file deletion...');
    const deleteResponse = await axios.delete(`${API_URL}/upload/test/${encodeURIComponent(fileUrl)}`);
    console.log('Delete response:', deleteResponse.data);

    // Clean up test file
    fs.unlinkSync(testImagePath);
    console.log('\nTest completed successfully!');
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Test failed: Axios error');
      if (error.response) {
        console.error('Status:', error.response.status);
        console.error('Data:', error.response.data);
      } else {
        console.error('Error message:', error.message);
      }
    } else {
      console.error('Test failed: Unknown error', error);
    }
  }
}

testUpload(); 