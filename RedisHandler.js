var redis = require("redis");
var Config = require('config');

var redisIp = Config.Redis.ip;
var redisPort = Config.Redis.port;
var password = Config.Redis.password;

var client = redis.createClient(redisPort, redisIp);

client.auth(password, function (error) {
    console.log("Redis Auth Error : "+error);
});
client.on("error", function (err) {
    console.log("Error " + err);

});

var addTrunkToCache = function(trunkId)
{
    var ttl = 2000;
    var lockKey = 'TRUNKLOCK:' + trunkId;

    redlock.lock(lockKey, ttl).then(function(lock)
    {
        dbModel.Trunk.find({ where:[{id: trunkId}], include : [{model: dbModel.TrunkIpAddress, as: "TrunkIpAddress"}]})
            .then(function (trunk)
            {
                if (trunk)
                {
                    client.set('TRUNK:' + trunkId, JSON.stringify(trunk), function(err, setResp)
                    {
                        lock.unlock()
                            .catch(function(err) {
                                logger.error('[DVP-ClusterConfiguration.addTrunkToCache] - [%s] - REDIS LOCK RELEASE FAILED', err);
                            });
                    });
                }
                else
                {
                    lock.unlock()
                        .catch(function(err) {
                            logger.error('[DVP-ClusterConfiguration.addTrunkToCache] - [%s] - REDIS LOCK RELEASE FAILED', err);
                        });
                }

            }).catch(function(err)
            {
                lock.unlock()
                    .catch(function(err) {
                        logger.error('[DVP-ClusterConfiguration.addTrunkToCache] - [%s] - REDIS LOCK RELEASE FAILED', err);
                    });
            });
    }).catch(function(err)
    {
        logger.error('[DVP-ClusterConfiguration.addTrunkToCache] - [%s] - REDIS LOCK ACQUIRE FAILED', err);
    });

};


var SetObject = function(key, value, callback)
{
    try
    {

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

var DeleteObject = function(key, callback)
{
    try
    {
        client.del(key, function(err, response)
        {
            callback(err, response);
        });

    }
    catch(ex)
    {
        callback(ex, null);
    }

};

var PublishToRedis = function(pattern, message, callback)
{
    try
    {
        if(client.connected)
        {
            var result = client.publish(pattern, message);
            logger.debug('[DVP-DynamicConfigurationGenerator.SetObjectWithExpire] - REDIS SUCCESS');
            callback(undefined, true);
        }
        else
        {
            callback(new Error('REDIS CLIENT DISCONNECTED'), false);
        }


    }
    catch(ex)
    {
        callback(ex, undefined);
    }
}





module.exports.SetObject = SetObject;
module.exports.DeleteObject = DeleteObject;
module.exports.addTrunkToCache = addTrunkToCache;
module.exports.PublishToRedis = PublishToRedis;
module.exports.redisClient = client;