const twilio = require('twilio');

exports.handler = function (context, event, callback) {
  
  // Grab the auth token from the request header
  const authHeader = event.request.headers.authorization;
  // Reject requests that don't have an Authorization header
  if (!authHeader) return callback(null, setUnauthorized(response));

  // The auth type and token are separated by a space, split them
  const [authType, authToken] = authHeader.split(' ');
  // If the auth type is not Bearer, return a 401 Unauthorized response
  if (authType.toLowerCase() !== 'bearer')
    return callback(null, setUnauthorized(response));

  if (authToken !== context.bearer_token) {
    return callback(null, 'Bad token');
  }


  const { to, content } = event;
  if (!to || !content) {
    return callback('Both "to" and "content" fields are required.', null);
  }

  let fromNumber = context.FROM_PHONE_NUMBER;
  
  const twilioClient = twilio(context.ACCOUNT_SID, context.AUTH_TOKEN);
  

  let additionalParams = {};
  additionalParams.body = content;

  //handle whatsapp
  if (to.startsWith('whatsapp')) {
    fromNumber = 'whatsapp:' + fromNumber;
  
    switch (content) {
      case 'template':
        
        //send a template
        additionalParams.contentSid = context.content_sid;
        break;
        
      case 'image':
        
        // send an image, replace the image url by yourself
        additionalParams.mediaUrl = 'https://www.conectasoftware.com/wp-content/uploads/2021/04/twilio.png';
        break;
      default:
        break;
    }
  }


  twilioClient.messages
    .create({
      to,
      from: fromNumber, 
      
      messagingServiceSid:context.msg_service_sid,
      ...additionalParams,
      
    })
    .then((message) => {
      console.log(`SMS sent: ${message.sid}`);
      return callback(null, { success: true });
    })
    .catch((error) => {
      console.error(`Error sending SMS: ${error.message}`);
      return callback(`Failed to send SMS: ${error.message}`, null);
    });
    
};
