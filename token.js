const AccessToken = Twilio.jwt.AccessToken;
const SyncGrant = AccessToken.SyncGrant;

exports.handler = (context, event, callback) => {
  // Create a Sync Grant for a particular Sync service, or use the default one
  const syncGrant = new SyncGrant({
    serviceSid: context.TWILIO_SYNC_SERVICE_SID || 'default',
  });

  // Create an access token which we will sign and return to the client,
  // containing the grant we just created
  // Use environment variables via `context` to keep your credentials secure
  const token = new AccessToken(
    context.ACCOUNT_SID,
    context.TWILIO_API_KEY,
    context.TWILIO_API_SECRET,
    { identity: 'w3c' }
  );

  token.addGrant(syncGrant);

  // Return two pieces of information: the name of the sync list so it can
  // be referenced by the client, and the JWT form of the access token
  
  let response = new Twilio.Response();

  // Create your response body object
  const responseBody = {
      syncListName: context.SYNC_LIST_NAME || 'serverless-sync',
      token: token.toJwt(), // Ensure 'token' is defined and correctly generated
  };

  

  // Set the response body using setBody method
  response.setBody(responseBody);
  
  // Set CORS headers, optional with security risk
  response.appendHeader('Access-Control-Allow-Origin', '*');
  response.appendHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  response.appendHeader('Access-Control-Allow-Headers', 'Content-Type');
  response.appendHeader('Content-Type', 'application/json');


  return callback(null, response);
};
