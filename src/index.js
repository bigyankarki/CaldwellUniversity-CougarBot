var express = require('express')
var bodyParser = require('body-parser')
var config = require('../config');
var events = require('./events');


module.exports.getWebhook = function(req, res){
  if (req.query['hub.verify_token'] === config.FB_VERIFY_TOKEN) {
    res.send(req.query['hub.challenge'])
  }
  res.send('Error, wrong token')
}


module.exports.postWebhook = (req, res) => {
  // Parse the request body from the POST
  let body = req.body;
  // Check the webhook event is from a Page subscription
  if (body.object === 'page') {
    // Iterate over each entry - there may be multiple if batched
    body.entry.forEach(function(entry) {

      // Get the webhook event. entry.messaging is an array, but
      // will only ever contain one event, so we get index 0
      let webhook_event = entry.messaging[0];
      //console.log(webhook_event.sender);


      // Get the sender PSID
      let sender_psid = webhook_event.sender.id;

      if (webhook_event.message) {
       events.handleMessage(sender_psid, webhook_event.message, webhook_event.sender.id);
     } else if (webhook_event.postback) {
       events.handlePostback(sender_psid, webhook_event.postback);
     }

    });
    // Return a '200 OK' response to all events
    res.status(200).send('EVENT_RECEIVED');
  } else {
    // Return a '404 Not Found' if event is not from a page subscription
    res.sendStatus(404);
  }
}