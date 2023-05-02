const webSocket = require('ws');
const { getAuthHeaders, getWsSpotUrl } = require('../utils/common');

const client = new webSocket(getWsSpotUrl());

client.onerror = () => {
  console.log('connection error');
};

client.onopen = () => {
  function subscribe() {
    if (client.readyState === client.OPEN) {
      // send auth
      const header = getAuthHeaders('/ws/spot');
      console.log('header: ' + JSON.stringify(header));

      const authPayload = {
        op: 'authKeyExpires',
        args: [header['btse-api'], header['btse-nonce'], header['btse-sign']],
      };

      console.log('sending auth msg: ' + JSON.stringify(authPayload));
      client.send(JSON.stringify(authPayload));

      // subscribe to fills websocket topic
      const payload = {
        op: 'subscribe',
        args: ['fills'],
      };
      console.log('sending msg: ' + JSON.stringify(payload));
      client.send(JSON.stringify(payload));

      console.log('\n\nwaiting for order to be transacted...\n\n');
    }
  }
  subscribe();
};

client.onclose = () => {
  console.log('echo-protocol client closed');
};

client.onmessage = (e) => {
  if (typeof e.data === 'string') {
    console.log("Received: '" + e.data + "'");
  }
};

process.on('SIGINT', () => {
  client.close();
  process.exit();
});
