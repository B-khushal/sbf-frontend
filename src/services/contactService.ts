import api from './api';

export interface ContactFormData {
  firstName: string;
  lastName: string;
  email: string;
  message: string;
}

export interface ContactInfo {
  address: {
    street: string;
    area: string;
    city: string;
    state: string;
    pincode: string;
    landmark: string;
  };
  phone: {
    primary: string;
    whatsapp: string;
  };
  email: string;
  businessHours: {
    [key: string]: string;
  };
  socialMedia: {
    website: string;
    whatsapp: string;
  };
}

// Submit contact form
export const submitContactForm = async (formData: ContactFormData) => {
  try {
    console.log('📤 Submitting contact form:', formData);
    
    const response = await api.post('/contact', formData);
    
    console.log('✅ Contact form submitted successfully:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Contact form submission error:', error);
    
    // Handle different error types
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    } else if (error.response?.status === 400) {
      throw new Error('Please check all fields are filled correctly');
    } else if (error.response?.status === 500) {
      throw new Error('Server error. Please try again later or contact us directly.');
    } else if (error.code === 'NETWORK_ERROR' || !error.response) {
      throw new Error('Network error. Please check your connection and try again.');
    } else {
      throw new Error('Failed to send message. Please try again.');
    }
  }
};

// Get contact information
export const getContactInfo = async (): Promise<ContactInfo> => {
  try {
    console.log('📞 Fetching contact information...');
    
    const response = await api.get('/contact/info');
    
    console.log('✅ Contact info retrieved:', response.data.contactInfo);
    return response.data.contactInfo;
  } catch (error: any) {
    console.error('❌ Error fetching contact info:', error);
    
    // Return default contact info if API fails
    const defaultContactInfo: ContactInfo = {
      address: {
        street: 'Pillar Number 32, Najam Centre, A/B, Door No. 12-2, 786',
        area: 'Rethi Bowli Road, Mehdipatnam',
        city: 'Hyderabad',
        state: 'Telangana',
        pincode: '500006',
        landmark: 'Near Tolichowki, Mehdipatnam'
      },
      phone: {
        primary: '+91 9949683222',
        whatsapp: '9949683222'
      },
      email: 'contact@sbflorist.in',
      businessHours: {
        monday: '8:00 AM - 11:00 PM',
        tuesday: '8:00 AM - 11:00 PM',
        wednesday: '8:00 AM - 11:00 PM',
        thursday: '8:00 AM - 11:00 PM',
        friday: '8:00 AM - 11:00 PM',
        saturday: '8:00 AM - 11:00 PM',
        sunday: '8:00 AM - 11:00 PM'
      },
      socialMedia: {
        website: 'https://sbflorist.in/',
        whatsapp: 'https://wa.me/9949683222'
      }
    };
    
    console.log('📞 Using default contact info due to API error');
    return defaultContactInfo;
  }
};

// Quick contact actions
export const openWhatsApp = (message?: string) => {
  const defaultMessage = "Hello! I'm interested in your flower arrangements.";
  const encodedMessage = encodeURIComponent(message || defaultMessage);
  const whatsappUrl = `https://wa.me/9949683222?text=${encodedMessage}`;
  window.open(whatsappUrl, '_blank');
};

export const openEmail = (subject?: string, body?: string) => {
  const defaultSubject = "Inquiry - Spring Blossoms Florist";
  const defaultBody = "Hello,\n\nI would like to inquire about your floral services.\n\nThank you!";
  
  const encodedSubject = encodeURIComponent(subject || defaultSubject);
  const encodedBody = encodeURIComponent(body || defaultBody);
  const emailUrl = `mailto:contact@sbflorist.in?subject=${encodedSubject}&body=${encodedBody}`;
  
  window.location.href = emailUrl;
};

export const callPhone = () => {
  window.location.href = 'tel:+919949683222';
};

export const openGoogleMaps = () => {
  const mapsUrl = 'https://www.google.com/maps?cid=8660521669298042697';
  window.open(mapsUrl, '_blank');
};
