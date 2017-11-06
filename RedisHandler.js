var redis = require("ioredis");
var config = require('config');

var redisip = config.Redis.ip;
var redisport = config.Redis.port;
var redispass = config.Redis.password;
var redismode = config.Redis.mode;
var redisdb = config.Redis.db;



var redisSetting =  {
    port:redisport,
    host:redisip,
    family: 4,
    password: redispass,
    db: redisdb,
    retryStrategy: function (times) {
        var delay = Math.min(times * 50, 2000);
        return delay;
    },
    reconnectOnError: function (err) {

        return true;
    }
};

if(redismode == 'sentinel'){

    if(config.Redis.sentinels && config.Redis.sentinels.hosts && config.Redis.sentinels.port && config.Redis.sentinels.name){
        var sentinelHosts = config.Redis.sentinels.hosts.split(',');
        if(Array.isArray(sentinelHosts) && sentinelHosts.length > 2){
            var sentinelConnections = [];

            sentinelHosts.forEach(function(item){

                sentinelConnections.push({host: item, port:config.Redis.sentinels.port})

            })

            redisSetting = {
                sentinels:sentinelConnections,
                name: config.Redis.sentinels.name,
                password: redispass
            }

        }else{

            console.log("No enough sentinel servers found .........");
        }

    }
}

var client = undefined;

if(redismode != "cluster") {
    client = new redis(redisSetting);
}else{

    var redisHosts = redisip.split(",");
    if(Array.isArray(redisHosts)){


        redisSetting = [];
        redisHosts.forEach(function(item){
            redisSetting.push({
                host: item,
                port: redisport,
                family: 4,
                password: redispass});
        });

        var client = new redis.Cluster([redisSetting]);

    }else{

        client = new redis(redisSetting);
    }


}

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
            var result = client.publish(pattern, message);
            logger.debug('[DVP-DynamicConfigurationGenerator.SetObjectWithExpire] - REDIS SUCCESS');
            callback(undefined, true);


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
