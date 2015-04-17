var redis = require("redis");
var Config = require('config');

var redisIp = Config.Redis.IpAddress;
var redisPort = Config.Redis.Port;

var client = redis.createClient(redisPort, redisIp);

var SetObject = function(key, value, callback)
{
    try
    {
        //var client = redis.createClient(redisPort, redisIp);

        client.set(key, value, function(err, response)
        {
            callback(err, response);
        });

    }
    catch(ex)
    {
        callback(ex, undefined);
    }

};

var PublishToRedis = function(pattern, message, callback)
{
    try
    {
        if(client.connected)
        {
            var result = client.publish(pattern, message);

            callback(undefined, result);
        }
        else
        {
            callback(undefined, false);
        }


    }
    catch(ex)
    {
        callback(ex, undefined);
    }
}


client.on('error', function(msg)
{

});

module.exports.SetObject = SetObject;
module.exports.PublishToRedis = PublishToRedis;