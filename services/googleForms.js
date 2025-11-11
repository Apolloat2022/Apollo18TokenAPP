import axios from 'axios';

const GFORM_URL = process.env.EXPO_PUBLIC_GFORM_URL;

export const googleFormsService = {
  // Submit waitlist form (this will open the form in browser)
  submitWaitlist: async (formData) => {
    try {
      // For Google Forms, we typically redirect to the form
      // If you want to submit programmatically, you need the form's submit URL
      const formSubmitUrl = GFORM_URL.replace('/viewform', '/formResponse');
      
      const formPayload = new URLSearchParams({
        'entry.1234567890': formData.email, // Replace with actual entry IDs
        'submit': 'Submit'
      });

      const response = await axios.post(formSubmitUrl, formPayload, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      
      return response.data;
    } catch (error) {
      console.error('Error submitting waitlist:', error);
      // Fallback: just open the form in browser
      if (window) {
        window.open(GFORM_URL, '_blank');
      }
      throw error;
    }
  }
};