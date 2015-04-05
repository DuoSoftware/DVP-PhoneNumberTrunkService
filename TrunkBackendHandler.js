var dbModel = require('./DVP-DBModels');
var underscore = require('underscore');
//var getGrpUsersById = function(grpId, callback)
//{
//    try
//    {
//        dbModel.UserGroup.find({ where: {id:grpId}, attributes: ['id'], include: [{model : dbModel.SipUACEndpoint, attributes:['id'], joinTableAttributes : ['createdAt']}]}).complete(function(err, trunkObj)
//        {
//            try
//            {
//                callback(err, trunkObj);
//            }
//            catch(ex)
//            {
//                callback(ex, undefined);
//            }
//        })
//    }
//    catch(ex)
//    {
//        callback(ex, false);
//    }
//};

var switchPhoneNumberCompany = function(phoneNumber, companyId, tenantId, companyToChange, tenantToChange, callback)
{
    try
    {
        dbModel.TrunkPhoneNumber.find({ where: [{PhoneNumber: phoneNumber }, { CompanyId: companyId}]}).complete(function(err, phnNumInfo)
        {
            if(err)
            {
                callback(err, false);
            }
            else if(phnNumInfo)
            {
                //update
                phnNumInfo.updateAttributes({CompanyId: companyToChange, TenantId: tenantToChange}).complete(function (err) {
                    if (err)
                    {
                        callback(err, false);
                    }
                    else {

                        callback(undefined, true);
                    }
                })
            }
            else
            {
                callback(new Error("Unable to find a phone number registered to given company"), false);
            }
        })
    }
    catch(ex)
    {
        callback(ex, false);
    }
}

var getTrunkById = function(trunkId, callback)
{
    try
    {
        dbModel.Trunk.find({where :[{id: trunkId }]}).complete(function(err, trunkObj)
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
        dbModel.Trunk.find({where :[{id: gwId}]}).complete(function(err, gwObj)
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

var AssignTrunkToProfile = function(gwId, profileId, callback)
{
    try
    {
        dbModel.SipNetworkProfile.find({where: [{id: profileId}, {ObjType: "EXTERNAL"}]}).complete(function (err, profRec)
        {
            if (!err && profRec)
            {
                dbModel.Trunk.find({where: [{id: gwId}]}).complete(function (err, gwRec)
                {
                    if (!err && gwRec)
                    {
                        profRec.addTrunk(gwRec).complete(function (err, result)
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
    }
    catch(ex)
    {
        callback(ex, false);
    }

};

var AssignTrunkToLoadBalancer = function(gwId, lbId, callback)
{
    try
    {
        dbModel.LoadBalancer.find({where: [{id: lbId}]}).complete(function (err, lbRec)
        {
            if (!err && lbRec)
            {
                dbModel.Trunk.find({where: [{id: gwId}]}).complete(function (err, gwRec)
                {
                    if (!err && gwRec)
                    {
                        lbRec.addTrunk(gwRec).complete(function (err, result)
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
    }
    catch(ex)
    {
        callback(ex, false);
    }

};

var AssignTrunkTranslation = function(gwId, transId, callback)
{
    try
    {
        dbModel.Translation.find({where: [{id: transId}]}).complete(function (err, transRec)
        {
            if (!err && transRec)
            {
                dbModel.Trunk.find({where: [{id: gwId}]}).complete(function (err, gwRec)
                {
                    if (!err && gwRec)
                    {
                        transRec.addTrunk(gwRec).complete(function (err, result)
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
    }
    catch(ex)
    {
        callback(ex, false);
    }

};

var AssignOperatorToTrunk = function(gwId, opId, callback)
{
    try
    {
        dbModel.TrunkOperator.find({where: [{id: opId}]}).complete(function (err, opRec)
        {
            if (!err && opRec)
            {
                dbModel.Trunk.find({where: [{id: gwId}]}).complete(function (err, gwRec)
                {
                    if (!err && gwRec)
                    {
                        opRec.addTrunk(gwRec).complete(function (err, result)
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
    }
    catch(ex)
    {
        callback(ex, false);
    }

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
            TenantId: gwInfo.TenantId
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

var AddTrunkOperator = function(opInfo, callback)
{
    try {

        var op = dbModel.TrunkOperator.build({
            OperatorName: opInfo.OperatorName,
            OperatorCode: opInfo.OperatorCode,
            ObjClass: opInfo.ObjClass,
            ObjType: opInfo.ObjType,
            ObjCategory: opInfo.ObjCategory,
            CompanyId: opInfo.CompanyId,
            TenantId: opInfo.TenantId
        });

        gw
            .save()
            .complete(function (err) {
                try {
                    if (!!err) {
                        callback(err, -1, false);
                    }
                    else {
                        var opId = op.id;
                        callback(undefined, opId, true);
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
        dbModel.Trunk.find({where:[{ id: trunkId }]}).complete(function(err, gwObj)
        {
            if(err)
            {
                callback(err, false);
            }
            else if(gwObj)
            {
                //update
                gwObj.updateAttributes({TrunkName: trunkInfo.TrunkName, Enable: trunkInfo.Enable, ObjClass: trunkInfo.ObjClass, IpUrl: trunkInfo.IpUrl, ObjType: trunkInfo.ObjType, ObjCategory: trunkInfo.ObjCategory}).complete(function (err) {
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

var removePhoneNumber = function(phoneNumber, companyId, tenantId, callback)
{
    try
    {
        dbModel.TrunkPhoneNumber.find({where: [{PhoneNumber: phoneNumber}, {CompanyId: companyId}]}).complete(function (err, phnNum)
        {
            if(err)
            {
                callback(err, false);
            }
            else
            {
                if(phnNum)
                {
                    phnNum.destroy().complete(function (err1, rslt)
                    {
                        if(!err1)
                        {
                            callback(undefined, true);
                        }
                        else
                        {
                            callback(err1, false);
                        }
                    });
                }
                else
                {
                    callback(new Error('Cannot find a phone number for the company'), false);
                }

            }
        });

    }
    catch(ex)
    {
        callback(ex, false);
    }
}

var addPhoneNumbersToTrunk = function(trunkId, phoneNumberInfo, callback)
{
    try
    {
        if(phoneNumberInfo)
        {
            dbModel.Trunk.find({where: [{id: trunkId}, {CompanyId: phoneNumberInfo.CompanyId}]}).complete(function (err, gwObj) {

                try
                {
                    if (err)
                    {
                        callback(err, -1, false);
                    }
                    else if (gwObj)
                    {

                        dbModel.TrunkPhoneNumber.find({where: [{PhoneNumber: phoneNumberInfo.PhoneNumber}]}).complete(function (error, phnNum)
                        {
                            try
                            {
                                if(phnNum)
                                {
                                    if(phnNum.CompanyId == phoneNumberInfo.CompanyId)
                                    {
                                        callback(new Error("Number already in use", -1, false));
                                    }
                                    else
                                    {
                                        callback(new Error("Another company using same phone number", -1, false));
                                    }
                                }
                                else
                                {
                                    //add phone number
                                    var phoneNum = dbModel.TrunkPhoneNumber.build({
                                        PhoneNumber: phoneNumberInfo.PhoneNumber,
                                        ObjClass: phoneNumberInfo.ObjClass,
                                        ObjType: phoneNumberInfo.ObjType,
                                        ObjCategory: phoneNumberInfo.ObjCategory,
                                        Enable: phoneNumberInfo.Enable,
                                        CompanyId: phoneNumberInfo.CompanyId,
                                        TenantId: phoneNumberInfo.TenantId
                                    });

                                    phoneNum
                                        .save()
                                        .complete(function (err)
                                        {
                                            try
                                            {
                                                if (err) {
                                                    callback(err, -1, false);
                                                }
                                                else
                                                {
                                                    try
                                                    {
                                                        gwObj.addTrunkPhoneNumber(phoneNum).complete(function (err, rslt)
                                                        {
                                                            try
                                                            {
                                                                if(err)
                                                                {
                                                                    phoneNum.delete().complete(function (err1, rslt)
                                                                    {
                                                                        if(!err1)
                                                                        {
                                                                            callback(err, -1, false);
                                                                        }
                                                                        else
                                                                        {
                                                                            callback(err1, -1, false);
                                                                        }
                                                                    });

                                                                }
                                                                else
                                                                {
                                                                    callback(err, phoneNum.id, true);
                                                                }
                                                            }
                                                            catch(ex)
                                                            {
                                                                callback(ex,-1, false);
                                                            }


                                                        });
                                                    }
                                                    catch(ex)
                                                    {
                                                        phoneNum.destroy().complete(function (err1, rslt)
                                                        {
                                                            if(!err1)
                                                            {
                                                                callback(ex, -1, false);
                                                            }
                                                            else
                                                            {
                                                                callback(err1, -1, false);
                                                            }
                                                        });
                                                    }

                                                }
                                            }
                                            catch (ex)
                                            {
                                                callback(ex,-1, false);
                                            }

                                        })

                                }
                            }
                            catch(ex)
                            {
                                callback(ex, -1, false);
                            }

                        });


                    }
                    else {
                        callback(new Error("Trunk Not Found for Given Id and Company"), -1, false);
                    }
                }
                catch(ex)
                {
                    callback(ex, -1, false);
                }

            })
        }
        else
        {
            callback(new Error("Empty phone number info"), -1, false);
        }
    }
    catch(ex)
    {
        callback(ex, -1, false);
    }
};

module.exports.addTrunkConfiguration = addTrunkConfiguration;
module.exports.AssignTrunkToLoadBalancer = AssignTrunkToLoadBalancer;
module.exports.setTrunkEnabledStatus = setTrunkEnabledStatus;
module.exports.getTrunkById = getTrunkById;
module.exports.updateTrunkConfiguration = updateTrunkConfiguration;
module.exports.switchPhoneNumberCompany = switchPhoneNumberCompany;
module.exports.removePhoneNumber = removePhoneNumber;
module.exports.addPhoneNumbersToTrunk = addPhoneNumbersToTrunk;
module.exports.AssignTrunkToProfile = AssignTrunkToProfile;
module.exports.AssignTrunkTranslation = AssignTrunkTranslation;
module.exports.AddTrunkOperator = AddTrunkOperator;
module.exports.AssignOperatorToTrunk = AssignOperatorToTrunk;
