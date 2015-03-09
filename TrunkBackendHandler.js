var dbModel = require('./DVP-DBModels');


var getGrpUsersById = function(grpId, callback)
{
    try
    {
        dbModel.UserGroup.find({ where: {id:grpId}, attributes: ['id'], include: [{model : dbModel.SipUACEndpoint, attributes:['id'], joinTableAttributes : ['createdAt']}]}).complete(function(err, trunkObj)
        {
            try
            {
                callback(err, trunkObj);
            }
            catch(ex)
            {
                callback(ex, undefined);
            }
        })
    }
    catch(ex)
    {
        callback(ex, false);
    }
};

var getTrunkById = function(trunkId, callback)
{
    try
    {
        dbModel.Trunk.find({ id: trunkId }).complete(function(err, trunkObj)
        {
            try
            {
                callback(err, trunkObj);
            }
            catch(ex)
            {
                callback(ex, undefined);
            }
        })
    }
    catch(ex)
    {
        callback(ex, false);
    }
};

var setTrunkEnabledStatus = function(gwId, status, callback)
{
    try
    {
        dbModel.Trunk.find({ id: gwId }).complete(function(err, gwObj)
        {
            if(err)
            {
                callback(err, false);
            }
            else if(gwObj)
            {
                //update
                gwObj.updateAttributes({Enable: status}).complete(function (err) {
                    if (err) {
                        callback(err, false);
                    }
                    else {
                        callback(undefined, true);
                    }
                })
            }
            else
            {
                callback(new Error("Trunk Not Found for Given Id"), false);
            }
        })
    }
    catch(ex)
    {
        callback(ex, false);
    }
};


var assignTrunkToCloud = function(gwId, cloudId, callback)
{
    dbModel.Cloud.find({where: [{id: cloudId}, {Activate: true}]}).complete(function (err, cloudRec)
    {
        if (!err && cloudRec)
        {
            dbModel.Trunk.find({where: [{id: gwId}]}).complete(function (err, gwRec)
            {
                if (!err && gwRec)
                {
                    cloudRec.addTrunk(gwRec).complete(function (err, result)
                    {
                        if(!err)
                        {
                            callback(undefined, true);
                        }
                        else
                        {
                            callback(err, true);
                        }

                    })
                }
                else
                {
                    callback(undefined, false);
                }

            })

        }
        else
        {
            callback(undefined, false);
        }})
};


var addTrunkConfiguration = function(gwInfo, callback)
{
    try {

        var gw = dbModel.Trunk.build({
            TrunkCode: gwInfo.TrunkCode,
            TrunkName: gwInfo.TrunkName,
            ObjClass: gwInfo.ObjClass,
            ObjType: gwInfo.ObjType,
            ObjCategory: gwInfo.ObjCategory,
            IpUrl: gwInfo.IpUrl,
            Enable: gwInfo.Enable,
            CompanyId: gwInfo.CompanyId,
            TenantId: gwInfo.TenantId,
            Operator: gwInfo.Operator
        });

        gw
            .save()
            .complete(function (err) {
                try {
                    if (!!err) {
                        callback(err, -1, false);
                    }
                    else {
                        var gwId = gw.id;
                        callback(undefined, gwId, true);
                    }
                }
                catch (ex) {
                    callback(ex,-1, false);
                }

            })

    }
    catch(ex)
    {
        callback(ex, -1, false);
    }
}

var updateTrunkConfiguration = function(trunkId, trunkInfo, callback)
{
    try
    {
        dbModel.Trunk.find({ id: trunkId }).complete(function(err, gwObj)
        {
            if(err)
            {
                callback(err, false);
            }
            else if(gwObj)
            {
                //update
                gwObj.updateAttributes({TrunkName: trunkInfo.TrunkName, Enable: trunkInfo.Enable, ObjClass: trunkInfo.ObjClass, IpUrl: trunkInfo.IpUrl, ObjType: trunkInfo.ObjType, ObjCategory: trunkInfo.ObjCategory, Operator: trunkInfo.Operator}).complete(function (err) {
                    if (err) {
                        callback(err, false);
                    }
                    else {
                        callback(undefined, true);
                    }
                })
            }
            else
            {
                callback(new Error("Trunk Not Found for Given Id"), false);
            }
        })
    }
    catch(ex)
    {
        callback(ex, false);
    }
};

module.exports.addTrunkConfiguration = addTrunkConfiguration;
module.exports.assignTrunkToCloud = assignTrunkToCloud;
module.exports.setTrunkEnabledStatus = setTrunkEnabledStatus;
module.exports.getTrunkById = getTrunkById;
module.exports.updateTrunkConfiguration = updateTrunkConfiguration;
module.exports.getGrpUsersById = getGrpUsersById;
