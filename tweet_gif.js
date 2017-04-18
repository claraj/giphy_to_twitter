var Twitter = require('twitter');
var request = require('request');
var fs = require('fs');   // File system


// TODO tidying, better error handling for all steps in the process. 


// Replace with your own keys/secrets
TWITTER_CONSUMER_KEY=''
TWITTER_CONSUMER_SECRET=''
TWITTER_ACCESS_TOKEN_KEY=''
TWITTER_ACCESS_TOKEN_SECRET=''

var client = new Twitter({
  consumer_key:TWITTER_CONSUMER_KEY,
  consumer_secret:TWITTER_CONSUMER_SECRET,
  access_token_key:TWITTER_ACCESS_TOKEN_KEY,
  access_token_secret:TWITTER_ACCESS_TOKEN_SECRET
});

getGif('kitten');  // Change to another subject of your choice

function getGif(subject){

  var filename = subject + '.gif'   // Todo error handling. Make sure subject text is a valid filename.

  var url = 'http://api.giphy.com/v1/gifs/random?api_key=dc6zaTOxFJmzC' ;

  request(url, q = { 'tag' : subject },  function(error, response, body){
    if (!error && response.statusCode == 200) {

      var resp = JSON.parse(body);
      var gifUrl = resp.data.image_url;

      //Download picture, save
      var filestream = request.get(gifUrl);
      filestream.pipe(fs.createWriteStream(filename));

      // And once saved, use to create tweet.
      filestream.on('end', function(){
        tweet_gif(filename, subject);
      });

    } else {
      console.log('Error getting gif', error, response.statusCode);
    }
  });
}


function tweet_gif(filename, subject) {

  var gif = fs.readFileSync(filename);
  var status_text = 'Random ' + subject + ' gif';

  client.post('media/upload', { media:gif }, function(err, media, response){
    if (err) {
      console.log('Error uploading media', err);
    }
    else {

      var tweet = { status : status_text, media_ids : media.media_id_string }

      console.log(media)
      client.post('statuses/update', tweet, function(error, tweet, response){
        if (error) {
          console.log('Error posting tweet' , error);
        }
        else {
          console.log("Posted this tweet", status_text);
        }
      });
    }
  });
}
