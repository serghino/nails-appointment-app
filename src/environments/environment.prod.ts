export const environment = {
  production: true,
  business: {
    name: 'Spa Tais - Beauty and Hair Salon',
    address: '2110 Boul. Saint-Laurent, Montreal, Quebec H2X 2T2',
    addressLine1: '2110 Boul. Saint-Laurent',
    addressLine2: 'Montreal, QC',
    postalCode: 'H2X 2T2',
    mapsUrl: 'https://www.google.com/maps/place/2110+Boul.+Saint-Laurent,+Montreal,+Quebec+H2X+2T2'
  },
  socialMedia: {
    instagram: 'https://www.instagram.com/maryoak.mtl?igsh=MWs4bmp2b2s3NmNsOQ==',
    facebook: 'https://www.facebook.com/share/1GQunLAEcd'
  },
  // EmailJS Configuration for Production
  // Set these values from your EmailJS dashboard
   emailjs: {
    publicKey: 'tqOofDkcq7LNN0DmP', // YOUR_EMAILJS_PUBLIC_KEY
    serviceId: 'service_bqjgqh8', // YOUR_EMAILJS_SERVICE_ID
    customerTemplateId: 'template_5u3mfik', // Template ID for customer confirmation
    adminTemplateId: 'template_yjzktns'     // Template ID for admin notification
  }
};
