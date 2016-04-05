var redis = require("redis");
var Config = require('config');

var redisIp = Config.Redis.ip;
var redisPort = Config.Redis.port;
var password = Config.Redis.password;

var client = redis.createClient(redisPort, redisIp);

client.auth(password, function (error) {
    console.log("Redis Auth Error : "+error);
});

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
};



module.exports.SetObject = SetObject;
module.exports.PublishToRedis = PublishToRedis;