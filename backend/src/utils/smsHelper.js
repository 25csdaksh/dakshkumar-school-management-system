// Helper for dispatching SMS notifications via Twilio
export const sendSMS = async (to, message) => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_PHONE_NUMBER;

  if (accountSid && authToken && from) {
    console.log(`[SMS-API] Initializing dispatch to ${to} via Twilio...`);
    try {
      // simulated POST request to twilio API
      const response = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
        {
          method: 'POST',
          headers: {
            'Authorization': 'Basic ' + Buffer.from(accountSid + ':' + authToken).toString('base64'),
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: new URLSearchParams({
            To: to,
            From: from,
            Body: message
          })
        }
      );
      const data = await response.json();
      console.log(`[SMS-API] Twilio dispatch response success: Message SID ${data.sid}`);
      return data;
    } catch (error) {
      console.error(`[SMS-API] Error dispatching SMS: ${error.message}`);
    }
  } else {
    // Simulated console log mode
    console.log(`[SMS-API-SIMULATION] Twilio parameters missing. Logging message:`);
    console.log(`To: ${to}`);
    console.log(`Body: ${message}`);
    return { success: true, simulated: true };
  }
};

export default sendSMS;
