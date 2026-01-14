import axios from 'axios';

export async function POST(request) {
  const { to, message } = await request.json();
  
  try {
    const response = await axios.post(
      `https://graph.facebook.com/v18.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: "whatsapp",
        to: to,
        text: { body: message }
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    return Response.json({ success: true, data: response.data });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}