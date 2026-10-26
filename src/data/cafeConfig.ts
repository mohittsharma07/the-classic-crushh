export interface CafeConfig {
  name: string;
  tagline: string;
  subTagline: string;
  shortDescription: string;
  phone: string;
  phoneDisplay: string;
  whatsappNumber: string; // e.g. "919876543210" without '+' or spaces for wa.me link
  whatsappDisplay: string;
  instagramHandle: string;
  instagramUrl: string;
  address: {
    street: string;
    area: string;
    city: string;
    landmark?: string;
  };
  timings: {
    days: string;
    hours: string;
    kitchenCloses?: string;
  };
  googleMapsUrl: string;
  googleMapsEmbedUrl: string;
}

export const CAFE_CONFIG: CafeConfig = {
  name: "THE CLASSIC CRUSH",
  tagline: "BAKERY & CAFE",
  subTagline: "Freshly made. Comfortingly familiar.",
  shortDescription: "A cozy neighbourhood vegetarian bakery & cafe made for good bites, sweet cravings, and warm conversations with friends.",
  phone: "+919876543210",
  phoneDisplay: "+91 98765 43210",
  whatsappNumber: "919876543210", // Configurable WhatsApp number
  whatsappDisplay: "+91 98765 43210",
  instagramHandle: "@theclassiccrush.cafe",
  instagramUrl: "https://instagram.com",
  address: {
    street: "Shop 4, Near College Road, Student Hub",
    area: "Civil Lines / University Circle",
    city: "Your City — 400001",
    landmark: "Right opposite Central Library",
  },
  timings: {
    days: "Monday – Sunday (Open All 7 Days)",
    hours: "10:30 AM – 10:30 PM",
    kitchenCloses: "Last order at 10:00 PM",
  },
  googleMapsUrl: "https://maps.google.com/?q=The+Classic+Crush+Bakery+Cafe",
  // Standard clean embed map preview
  googleMapsEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d114000!2d75.7873!3d26.9124!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjbCsDU0JzQ0LjYiTiA3NcKwNDcnMTQuMyJF!5e0!3m2!1sen!2sin!4v1650000000000!5m2!1sen!2sin",
};

/**
 * Generate a prefilled WhatsApp link
 */
export function getWhatsAppLink(customMessage?: string): string {
  const text = customMessage || `Hi ${CAFE_CONFIG.name}! I'm viewing your website and would like to place an order / have a query.`;
  return `https://wa.me/${CAFE_CONFIG.whatsappNumber}?text=${encodeURIComponent(text)}`;
}

export function getCallLink(): string {
  return `tel:${CAFE_CONFIG.phone}`;
}
