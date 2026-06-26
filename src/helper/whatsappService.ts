import axios from 'axios';

const WHATSAPP_API_URL = 'https://partnersv1.pinbot.ai/v3/810108682184519/messages';
const WHATSAPP_API_KEY = process.env.WABA_API_KEY!;

interface WhatsAppTemplateComponent {
  type: 'header' | 'body' | 'button';
  parameters?: Array<{
    type: 'text' | 'video' | 'image';
    text?: string;
    video?: { link: string };
    image?: { link: string };
  }>;
  sub_type?: 'url';
  index?: number;
}

interface WhatsAppTextMessage {
  phone: string;
  message: string;
}

interface WhatsAppVideoMessage {
  phone: string;
  videoUrl: string;
  caption?: string;
}
export const sendWhatsAppTemplateMessage = async ({ 
  phone, 
  templateName,
  languageCode = 'en',
  components = []
}: {
  phone: string;
  templateName: string;
  languageCode?: string;
  components?: WhatsAppTemplateComponent[];
}) => {
  try {
    console.log(`[WhatsApp] Sending template message to: ${phone}`);
    
    const payload: any = {
      messaging_product: "whatsapp",
      to: phone,
      type: "template",
      template: {
        name: templateName,
        language: {
          code: languageCode
        }
      }
    };

    if (components.length > 0) {
      payload.template.components = components;
    }

    console.log('[WhatsApp] Template payload:', JSON.stringify(payload, null, 2));

    const response = await axios.post(WHATSAPP_API_URL, payload, {
      headers: {
        'Content-Type': 'application/json',
        'apikey': WHATSAPP_API_KEY
      }
    });

    console.log('[WhatsApp] Template message sent successfully:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('[WhatsApp] Error sending template message:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || error.message);
  }
};

export const sendWhatsAppTextMessage = async ({ phone, message }: WhatsAppTextMessage) => {
  try {
    console.log(`[WhatsApp] Sending text message to: ${phone}`);
    
    const payload = {
      messaging_product: "whatsapp",
      preview_url: false,
      recipient_type: "individual",
      to: phone,
      type: "text",
      text: {
        body: message
      }
    };

    const response = await axios.post(WHATSAPP_API_URL, payload, {
      headers: {
        'Content-Type': 'application/json',
        'apikey': WHATSAPP_API_KEY
      }
    });

    console.log('[WhatsApp] Text message sent successfully:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('[WhatsApp] Error sending text message:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || error.message);
  }
};

export const sendWhatsAppVideoMessage = async ({ phone, videoUrl, caption }: WhatsAppVideoMessage) => {
  try {
    console.log(`[WhatsApp] Sending video message to: ${phone}`);
    
    const payload = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: phone,
      type: "video",
      video: {
        link: videoUrl,
        caption: caption || ""
      }
    };

    const response = await axios.post(WHATSAPP_API_URL, payload, {
      headers: {
        'Content-Type': 'application/json',
        'apikey': WHATSAPP_API_KEY
      }
    });

    console.log('[WhatsApp] Video message sent successfully:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('[WhatsApp] Error sending video message:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || error.message);
  }
};

export const formatPhoneNumber = (phone: string): string => {
  // Remove all non-digit characters
  let cleaned = phone.replace(/\D/g, '');
  
  console.log('[WhatsApp] Original phone:', phone);
  console.log('[WhatsApp] Cleaned phone:', cleaned);
  console.log('[WhatsApp] Length:', cleaned.length);
  
  // If already has 91 prefix and is 12 digits total
  if (cleaned.startsWith('91') && cleaned.length === 12) {
    console.log('[WhatsApp] ✓ Already in correct format');
    return cleaned;
  }
  
  // If it's 10 digits (Indian mobile without country code)
  if (cleaned.length === 10) {
    const formatted = '91' + cleaned;
    console.log('[WhatsApp] ✓ Added country code:', formatted);
    return formatted;
  }
  
  // If it starts with 0 (some inputs have leading 0)
  if (cleaned.startsWith('0') && cleaned.length === 11) {
    const formatted = '91' + cleaned.substring(1);
    console.log('[WhatsApp] ✓ Removed leading 0 and added country code:', formatted);
    return formatted;
  }
  
  console.log('[WhatsApp] ⚠ Unusual format, returning as-is:', cleaned);
  return cleaned;
};