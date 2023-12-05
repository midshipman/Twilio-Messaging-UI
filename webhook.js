exports.handler = async (context, event, callback) => {
  // Make sure the necessary Sync names are defined.
  const syncServiceSid = context.TWILIO_SYNC_SERVICE_SID || 'default';
  const syncListName = context.SYNC_LIST_NAME || 'serverless-sync';
  // You can quickly access a Twilio Sync client via Runtime.getSync()
  const syncClient = Runtime.getSync({ serviceName: syncServiceSid });
  const twiml = new Twilio.twiml.MessagingResponse();

  // Destructure the incoming text message and rename it to `message`
  const { Body: message } = event;

  const { From: fromNumber } = event;

  const { MediaUrl0: mediaUrl } = event;

  try {
    // Ensure that the Sync List exists before we try to add a new message to it
    await getOrCreateResource(syncClient.lists, syncListName);
    // Append the incoming message to the list
    await syncClient.lists(syncListName).syncListItems.create({
      data: {
        message,fromNumber, mediaUrl
      },
    });
    // Send a response back to the user to let them know the message was received
    twiml.message('SMS received and added to the list! 🚀');
    return callback(null, { success: true });
  } catch (error) {
    // Persist the error to your logs so you can debug
    console.error(error);
    // Send a response back to the user to let them know something went wrong
    twiml.message('Something went wrong with adding your message 😔');
    return callback(null, twiml);
  }
};

// Helper method to simplify getting a Sync resource (Document, List, or Map)
// that handles the case where it may not exist yet.
const getOrCreateResource = async (resource, name, options = {}) => {
  try {
    // Does this resource (Sync Document, List, or Map) exist already? Return it
    return await resource(name).fetch();
  } catch (err) {
    // It doesn't exist, create a new one with the given name and return it
    options.uniqueName = name;
    return resource.create(options);
  }
};
