// Helper for WhatsApp template dispatch notifications
export const sendWhatsAppNotification = async (to, templateName, parameters = []) => {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (token && phoneId) {
    console.log(`[WHATSAPP-API] Dispatching template ${templateName} to ${to}...`);
    try {
      const response = await fetch(
        `https://graph.facebook.com/v17.0/${phoneId}/messages`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            to: to,
            type: 'template',
            template: {
              name: templateName,
              language: { code: 'en_US' },
              components: [
                {
                  type: 'body',
                  parameters: parameters.map(p => ({ type: 'text', text: p }))
                }
              ]
            })
          })
        }
      );
      const data = await response.json();
      console.log(`[WHATSAPP-API] Sent successfully: Message ID ${data.messages?.[0]?.id}`);
      return data;
    } catch (error) {
      console.error(`[WHATSAPP-API] Error sending template: ${error.message}`);
    }
  } else {
    // Simulated console log mode
    console.log(`[WHATSAPP-API-SIMULATION] WhatsApp parameters missing. Logging template:`);
    console.log(`Recipient: ${to}`);
    console.log(`Template: ${templateName}`);
    console.log(`Variables: ${JSON.stringify(parameters)}`);
    return { success: true, simulated: true };
  }
};

export default sendWhatsAppNotification;
