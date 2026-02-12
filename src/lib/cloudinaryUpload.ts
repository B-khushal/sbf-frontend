// Cloudinary upload utility
export async function uploadToCloudinary(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', 'sbf-uploads');

  const response = await fetch('https://api.cloudinary.com/v1_1/djtrhfqan/image/upload', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Failed to upload image to Cloudinary');
  }

  const data = await response.json();
  return data.secure_url; // The Cloudinary image URL
} 