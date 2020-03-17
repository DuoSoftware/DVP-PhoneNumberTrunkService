var dbModel = require('dvp-dbmodels');
var underscore = require('underscore');
var logger = require('dvp-common/LogHandler/CommonLogHandler.js').logger;
var redisCacheHandler = require('dvp-common/CSConfigRedisCaching/RedisHandler.js');
var Promise = require('bluebird');
var async = require('async');
var extApiAccess = require('./ExternalApiAccess.js');

var GetPhoneNumbersOfTrunk = function(reqId, trunkId, companyId, tenantId, callback)
{
    var emptyList = [];
    try
    {
        dbModel.Trunk.find({where :[{id: trunkId},{CompanyId: companyId},{TenantId: tenantId}]}).then(function(trunkObj)
        {
            if(trunkObj)
            {
                dbModel.TrunkPhoneNumber.findAll({where :[{TrunkId: trunkId}], include:[{model: dbModel.LimitInfo, as: 'LimitInfoInbound'},{model: dbModel.LimitInfo, as: 'LimitInfoOutbound'},{model: dbModel.LimitInfo, as: 'LimitInfoBoth'}]}).then(function(trunkNumberList)
                {
                    callback(null, trunkNumberList);

                }).catch(function(err)
                {
                    callback(err, emptyList);
                })
            }

        }).catch(function(err)
        {
            callback(err, emptyList);
        })
    }
    catch(ex)
    {
        callback(ex, emptyList);
    }

};

var GetPhoneNumber = function(reqId, tenantId, phnNum, callback)
{
    try
    {
        dbModel.TrunkPhoneNumber.find({where :[{PhoneNumber: phnNum, TenantId: tenantId}]}).then(function(trunkNumber)
        {
            callback(null, trunkNumber);

        }).catch(function(err)
        {
            callback(err, null);
        })
    }
    catch(ex)
    {
        callback(ex, null);
    }

};

var AddPhoneNumberToClientCompany = function(reqId, phnNumInfo, companyId, tenantId)
{

    return new Promise(function(fulfill, reject)
    {
        try
        {
            //First validate whether trunk belongs to requesters company

            dbModel.Trunk.find({where :[{id: phnNumInfo.TrunkId},{CompanyId: companyId},{TenantId: tenantId}]}).then(function(trunkObj)
            {
                if(trunkObj)
                {
                    //check number already in use
                    dbModel.TrunkPhoneNumber.find({where :[{PhoneNumber: phnNumInfo.PhoneNumber}]}).then(function(trunkNumber)
                    {
                        if(!trunkNumber)
                        {
                            //add limits
                            var limitExecutionArr = [];
                            var indexMapper = {};
                            var i = 0;

                            if(phnNumInfo.InboundLimit)
                            {
                                limitExecutionArr.push(extApiAccess.addNewLimitCallback.bind(this, reqId, phnNumInfo.PhoneNumber, phnNumInfo.PhoneNumber + ' INBOUND', phnNumInfo.InboundLimit, phnNumInfo.ClientCompany, tenantId));
                                indexMapper['INBOUND'] = i;
                                i++;
                            }

                            if(phnNumInfo.OutboundLimit)
                            {
                                limitExecutionArr.push(extApiAccess.addNewLimitCallback.bind(this, reqId, phnNumInfo.PhoneNumber, phnNumInfo.PhoneNumber + ' OUTBOUND', phnNumInfo.OutboundLimit, phnNumInfo.ClientCompany, tenantId));
                                indexMapper['OUTBOUND'] = i;
                                i++;
                            }

                            if(phnNumInfo.BothLimit)
                            {
                                limitExecutionArr.push(extApiAccess.addNewLimitCallback.bind(this, reqId, phnNumInfo.PhoneNumber, phnNumInfo.PhoneNumber + ' BOTH', phnNumInfo.BothLimit, phnNumInfo.ClientCompany, tenantId));
                                indexMapper['BOTH'] = i;
                            }

                            async.parallel(limitExecutionArr, function(err, limitExecResult)
                            {
                                if (err)
                                {
                                    reject(err);
                                }
                                else
                                {
                                    var num = dbModel.TrunkPhoneNumber.build({
                                        PhoneNumber: phnNumInfo.PhoneNumber,
                                        ObjClass: 'DVP',
                                        ObjType: phnNumInfo.ObjType,
                                        ObjCategory: phnNumInfo.ObjCategory,
                                        CompanyId: phnNumInfo.ClientCompany,
                                        TenantId: tenantId,
                                        Enable: phnNumInfo.Enable,
                                        TrunkId: phnNumInfo.TrunkId
                                    });

                                    if (indexMapper.hasOwnProperty('INBOUND') && limitExecResult[indexMapper['INBOUND']])
                                    {
                                        num.InboundLimitId = limitExecResult[indexMapper['INBOUND']].LimitId;
                                    }

                                    if (indexMapper.hasOwnProperty('OUTBOUND') && limitExecResult[indexMapper['OUTBOUND']])
                                    {
                                        num.OutboundLimitId = limitExecResult[indexMapper['OUTBOUND']].LimitId;
                                    }

                                    if (indexMapper.hasOwnProperty('BOTH') && limitExecResult[indexMapper['BOTH']])
                                    {
                                        num.BothLimitId = limitExecResult[indexMapper['BOTH']].LimitId;
                                    }

                                    num
                                        .save()
                                        .then(function (rslt)
                                        {
                                            fulfill(rslt);

                                        }).catch(function (err)
                                        {
                                            reject(err);
                                        })
                                }
                            });
                        }
                        else
                        {
                            reject(new Error('Phone number exists'));
                        }

                    }).catch(function(err)
                    {
                        reject(err);
                    })
                }
                else
                {
                    reject(new Error('Trunk does not belong to your company'));

                }

            }).catch(function(err)
            {
                reject(err);
            })
        }
        catch(ex)
        {
            reject(ex);
        }
    });


};

var UpdatePhoneNumberToClientCompany = function(reqId, phnNumInfo, companyId, tenantId)
{

    return new Promise(function(fulfill, reject)
    {
        try
        {
            //First validate whether trunk belongs to requesters company

            dbModel.Trunk.find({where :[{id: phnNumInfo.TrunkId},{CompanyId: companyId},{TenantId: tenantId}]}).then(function(trunkObj)
            {
                if(trunkObj)
                {
                    //check number already in use
                    dbModel.TrunkPhoneNumber.find({where :[{PhoneNumber: phnNumInfo.PhoneNumber, TrunkId: phnNumInfo.TrunkId, TenantId: tenantId}]}).then(function(trunkNumber)
                    {
                        if(trunkNumber)
                        {
                            //add limits
                            var limitExecutionArr = [];
                            var indexMapper = {};
                            var i = 0;

                            if(phnNumInfo.InboundLimitId)
                            {
                                if(!phnNumInfo.InboundLimit)
                                {
                                    phnNumInfo.InboundLimit = 0;
                                }
                                limitExecutionArr.push(extApiAccess.updateLimitCompSwitchCallback.bind(this, reqId, phnNumInfo.InboundLimitId, phnNumInfo.InboundLimit, phnNumInfo.ClientCompany, tenantId));
                                indexMapper['INBOUND'] = i;
                                i++;
                            }
                            else
                            {
                                limitExecutionArr.push(extApiAccess.addNewLimitCallback.bind(this, reqId, phnNumInfo.PhoneNumber, phnNumInfo.PhoneNumber + ' INBOUND', phnNumInfo.InboundLimit, phnNumInfo.ClientCompany, tenantId));
                                indexMapper['INBOUND'] = i;
                                i++;
                            }

                            if(phnNumInfo.OutboundLimitId)
                            {
                                if(!phnNumInfo.OutboundLimit)
                                {
                                    phnNumInfo.OutboundLimit = 0;
                                }

                                limitExecutionArr.push(extApiAccess.updateLimitCompSwitchCallback.bind(this, reqId, phnNumInfo.OutboundLimitId, phnNumInfo.OutboundLimit, phnNumInfo.ClientCompany, tenantId));
                                indexMapper['OUTBOUND'] = i;
                                i++;
                            }
                            else
                            {
                                limitExecutionArr.push(extApiAccess.addNewLimitCallback.bind(this, reqId, phnNumInfo.PhoneNumber, phnNumInfo.PhoneNumber + ' OUTBOUND', phnNumInfo.OutboundLimit, phnNumInfo.ClientCompany, tenantId));
                                indexMapper['OUTBOUND'] = i;
                                i++;
                            }

                            if(phnNumInfo.BothLimitId)
                            {
                                if(!phnNumInfo.BothLimit)
                                {
                                    phnNumInfo.BothLimit = 0;
                                }
                                limitExecutionArr.push(extApiAccess.updateLimitCompSwitchCallback.bind(this, reqId, phnNumInfo.BothLimitId, phnNumInfo.BothLimit, phnNumInfo.ClientCompany, tenantId));
                                indexMapper['BOTH'] = i;
                            }
                            else
                            {
                                limitExecutionArr.push(extApiAccess.addNewLimitCallback.bind(this, reqId, phnNumInfo.PhoneNumber, phnNumInfo.PhoneNumber + ' BOTH', phnNumInfo.BothLimit, phnNumInfo.ClientCompany, tenantId));
                                indexMapper['BOTH'] = i;
                            }

                            async.parallel(limitExecutionArr, function(err, limitExecResult)
                            {
                                if (err)
                                {
                                    reject(err);
                                }
                                else
                                {
                                    var obj = {

                                        Enable: phnNumInfo.Enable,
                                        CompanyId: phnNumInfo.ClientCompany,
                                        ObjCategory: phnNumInfo.ObjCategory

                                    };

                                    if (indexMapper.hasOwnProperty('INBOUND') && limitExecResult[indexMapper['INBOUND']])
                                    {
                                        obj.InboundLimitId = limitExecResult[indexMapper['INBOUND']].LimitId;
                                    }

                                    if (indexMapper.hasOwnProperty('OUTBOUND') && limitExecResult[indexMapper['OUTBOUND']])
                                    {
                                        obj.OutboundLimitId = limitExecResult[indexMapper['OUTBOUND']].LimitId;
                                    }

                                    if (indexMapper.hasOwnProperty('BOTH') && limitExecResult[indexMapper['BOTH']])
                                    {
                                        obj.BothLimitId = limitExecResult[indexMapper['BOTH']].LimitId;
                                    }

                                    trunkNumber.updateAttributes(obj).then(function(rslt)
                                    {
                                        fulfill(rslt);
                                    }).catch(function(err)
                                    {
                                        reject(err);
                                    });
                                }
                            });
                        }
                        else
                        {
                            reject(new Error('Phone number does not exist'));
                        }

                    }).catch(function(err)
                    {
                        reject(err);
                    })
                }
                else
                {
                    reject(new Error('Trunk does not belong to your company'));

                }

            }).catch(function(err)
            {
                reject(err);
            })
        }
        catch(ex)
        {
            reject(ex);
        }
    });


};


var SwitchPhoneNumberCompanyDB = function(reqId, phoneNumber, companyId, tenantId, companyToChange, tenantToChange, callback)
{
    try
    {

        dbModel.TrunkPhoneNumber.find({ where: [{PhoneNumber: phoneNumber }, { CompanyId: companyId}]}).then(function(phnNumInfo)
        {
            if(phnNumInfo)
            {
                //update
                logger.debug('[DVP-PhoneNumberTrunkService.SwitchPhoneNumberCompanyDB] - [%s] - Get trunk phone number PGSQL query success', reqId);
                phnNumInfo.updateAttributes({CompanyId: companyToChange, TenantId: tenantToChange}).then(function (upRes)
                {
                    if(upRes)
                    {
                        redisCacheHandler.addTrunkNumberToCache(upRes.PhoneNumber, upRes);
                        redisCacheHandler.removeTrunkNumberByIdFromCache(upRes.id, companyId, tenantId);
                        redisCacheHandler.addTrunkNumberByIdToCache(upRes.id, companyToChange, tenantToChange, upRes);

                    }
                    logger.debug('[DVP-PhoneNumberTrunkService.SwitchPhoneNumberCompanyDB] - [%s] - update phone number company PGSQL query success', reqId);

                    callback(undefined, true);

                }).catch(function(err)
                {
                    logger.error('[DVP-PhoneNumberTrunkService.SwitchPhoneNumberCompanyDB] - [%s] - update phone number company PGSQL query failed', reqId, err);

                    callback(err, false);
                })
            }
            else
            {
                logger.debug('[DVP-PhoneNumberTrunkService.SwitchPhoneNumberCompanyDB] - [%s] - Get trunk phone number PGSQL query success', reqId);
                callback(new Error("Unable to find a phone number registered to given company"), false);
            }
        }).catch(function(err)
        {
            logger.error('[DVP-PhoneNumberTrunkService.SwitchPhoneNumberCompanyDB] - [%s] - Get trunk phone number PGSQL query failed', reqId, err);

            callback(err, false);
        })
    }
    catch(ex)
    {
        logger.error('[DVP-PhoneNumberTrunkService.SwitchPhoneNumberCompanyDB] - [%s] - Exception occurred', reqId, ex);
        callback(ex, false);
    }
};


var GetTrunkByIdDB = function(reqId, trunkId, companyId, tenantId, callback)
{
    try
    {
        dbModel.Trunk.find({where :[{id: trunkId},{CompanyId: companyId},{TenantId: tenantId}], include:[{model: dbModel.LoadBalancer, as: "LoadBalancer", include:[{model: dbModel.Cloud, as: "Cloud"}]}]}).then(function(trunkObj)
        {
            logger.debug('[DVP-PhoneNumberTrunkService.GetTrunkByIdDB] - [%s] - PGSQL get trunk query success', reqId);

            callback(undefined, trunkObj);
        }).catch(function(err)
        {
            logger.error('[DVP-PhoneNumberTrunkService.GetTrunkByIdDB] - [%s] - PGSQL get trunk query failed', reqId, err);
            callback(err, undefined);
        })
    }
    catch(ex)
    {
        logger.error('[DVP-PhoneNumberTrunkService.GetTrunkByIdDB] - [%s] - Exception occurred', reqId, ex);
        callback(ex, false);
    }
};

var GetTrunkListDB = function(reqId, companyId, tenantId, callback)
{
    var emptyList = [];
    try
    {
        dbModel.Trunk.findAll({where :[{CompanyId: companyId},{TenantId: tenantId}]}).then(function(trunkList)
        {
            trunkList.forEach(function(tr)
            {
                if(tr.Codecs)
                {
                    tr.Codecs = JSON.parse(tr.Codecs);
                }

            });
            logger.debug('[DVP-PhoneNumberTrunkService.GetTrunkByIdDB] - [%s] - PGSQL get trunk query success', reqId);

            callback(undefined, trunkList);
        }).catch(function(err)
        {
            logger.error('[DVP-PhoneNumberTrunkService.GetTrunkByIdDB] - [%s] - PGSQL get trunk query failed', reqId, err);
            callback(err, emptyList);
        })
    }
    catch(ex)
    {
        logger.error('[DVP-PhoneNumberTrunkService.GetTrunkByIdDB] - [%s] - Exception occurred', reqId, ex);
        callback(ex, false);
    }
};

var GetTrunkIpAddressList = function(reqId, trunkId, companyId, tenantId, callback)
{
    var emptyList = [];
    try
    {
        dbModel.TrunkIpAddress.findAll({where :[{CompanyId: companyId},{TenantId: tenantId},{TrunkId: trunkId}]}).then(function(trunkIpList)
        {
            callback(undefined, trunkIpList);
        }).catch(function(err)
        {
            logger.error('[DVP-PhoneNumberTrunkService.GetTrunkIpAddressList] - [%s] - PGSQL get trunk ips query failed', reqId, err);
            callback(err, emptyList);
        })
    }
    catch(ex)
    {
        logger.error('[DVP-PhoneNumberTrunkService.GetTrunkIpAddressList] - [%s] - Exception occurred', reqId, ex);
        callback(ex, false);
    }
};

var GetCallServerByProfileIdDB = function(reqId, profileId, callback)
{
    try
    {
        dbModel.SipNetworkProfile.find({where :[{id: profileId}], include: [{model: dbModel.CallServer, as: "CallServer"}]}).then(function(csObj)
        {
            logger.debug('[DVP-PhoneNumberTrunkService.GetCallServerByProfileIdDB] - [%s] - PGSQL query success', reqId);

            callback(undefined, csObj);
        }).catch(function(err)
        {
            logger.error('[DVP-PhoneNumberTrunkService.GetCallServerByProfileIdDB] - [%s] - PGSQL query failed', reqId, err);
            callback(err, undefined);
        })
    }
    catch(ex)
    {
        logger.error('[DVP-PhoneNumberTrunkService.GetCallServerByProfileIdDB] - [%s] - Exception occurred', reqId, ex);
        callback(ex, undefined);
    }
};

var GetCallServersRelatedToLoadBalancerDB = function(reqId, lbId, callback)
{
    var CallServerList = [];
    try
    {
        dbModel.LoadBalancer.find({where :[{id: lbId}], include: [{model: dbModel.Cloud, as: "Cloud", include: [{model: dbModel.CallServer, as: "CallServer"}]}]}).then(function(resultInfo)
        {

                logger.debug('[DVP-PhoneNumberTrunkService.GetCallServersRelatedToLoadBalancerDB] - [%s] - Get callservers related to load balancer PGSQL query success', reqId);
                if(resultInfo.Cloud)
                {
                    if(resultInfo.Cloud.CallServer && resultInfo.Cloud.CallServer.length > 0)
                    {
                        CallServerList.push.apply(CallServerList, resultInfo.Cloud.CallServer);
                        //get all clouds where parentcloudId equals cloud id

                        var clusterId = resultInfo.Cloud.id;

                        dbModel.Cloud.findAll({where :[{ParentCloudId: clusterId}], include: [{model: dbModel.CallServer, as: "CallServer"}]}).then(function(childCloudInfo)
                        {
                            if(childCloudInfo)
                            {
                                logger.debug('[DVP-PhoneNumberTrunkService.GetCallServersRelatedToLoadBalancerDB] - [%s] - PGSQL query success', reqId);
                                childCloudInfo.forEach(function(cld)
                                {
                                    if(cld.CallServer)
                                    {
                                        //add callserver details to array
                                        CallServerList.push(cld.CallServer);
                                    }
                                });

                                callback(undefined, CallServerList);
                            }
                            else
                            {
                                logger.debug('[DVP-PhoneNumberTrunkService.GetCallServersRelatedToLoadBalancerDB] - [%s] - PGSQL query success', reqId);
                                callback(undefined, CallServerList);
                            }

                        }).catch(function(err)
                        {
                            logger.error('[DVP-PhoneNumberTrunkService.GetCallServersRelatedToLoadBalancerDB] - [%s] - PGSQL query failed', reqId, err);
                            //give other call servers only
                            callback(err, CallServerList);
                        });
                    }
                    else
                    {
                        callback(undefined, CallServerList);
                    }
                }
                else
                {
                    callback(undefined, CallServerList);
                }


        }).catch(function(err)
        {
            logger.error('[DVP-PhoneNumberTrunkService.GetCallServersRelatedToLoadBalancerDB] - [%s] - Get callservers related to load balancer PGSQL query failed', reqId, err);

            callback(err, CallServerList);
        })
    }
    catch(ex)
    {
        logger.error('[DVP-PhoneNumberTrunkService.GetCallServersRelatedToLoadBalancerDB] - [%s] - Exception occurred', reqId, ex);
        callback(err, CallServerList);
    }

};

var SetTrunkEnabledStatusDB = function(reqId, gwId, status, companyId, tenantId, callback)
{
    try
    {
        dbModel.Trunk.find({where :[{id: gwId},{CompanyId: companyId},{TenantId: tenantId}]}).then(function(gwObj)
        {
            if(gwObj)
            {
                logger.debug('[DVP-PhoneNumberTrunkService.SetTrunkEnabledStatusDB] - [%s] - PGSQL get trunk query success', reqId);
                //update


                gwObj.updateAttributes({Enable: status}).then(function (upRes)
                {
                    redisCacheHandler.addTrunkToCache(gwObj.id);

                        logger.debug('[DVP-PhoneNumberTrunkService.SetTrunkEnabledStatusDB] - [%s] - PGSQL update trunk availability query success', reqId);
                        callback(undefined, true);

                }).catch(function(err)
                {
                    logger.error('[DVP-PhoneNumberTrunkService.SetTrunkEnabledStatusDB] - [%s] - PGSQL update trunk availability query failed', reqId, err);

                    callback(err, false);
                })
            }
            else
            {
                logger.debug('[DVP-PhoneNumberTrunkService.SetTrunkEnabledStatusDB] - [%s] - PGSQL get trunk query success', reqId);
                callback(new Error("Trunk Not Found for Given Id"), false);
            }
        }).catch(function(err)
        {
            logger.error('[DVP-PhoneNumberTrunkService.SetTrunkEnabledStatusDB] - [%s] - PGSQL get trunk query failed', reqId, err);

            callback(err, false);
        })
    }
    catch(ex)
    {
        logger.error('[DVP-PhoneNumberTrunkService.SetTrunkEnabledStatusDB] - [%s] - Exception occurred', reqId, ex);
        callback(ex, false);
    }
};

var AssignTrunkToProfile = function(reqId, gwId, profileId, companyId, tenantId, callback)
{
    try
    {
        dbModel.SipNetworkProfile.find({where: [{id: profileId},{CompanyId: companyId},{TenantId: tenantId},{ObjType: "EXTERNAL"}]}).then(function (profRec)
        {

            if (profRec)
            {
                logger.debug('[DVP-PhoneNumberTrunkService.AssignTrunkToProfile] - [%s] - get sip profile PGSQL query success', reqId);
                dbModel.Trunk.find({where: [{id: gwId},{CompanyId: companyId},{TenantId: tenantId}]}).then(function (gwRec)
                {
                    if(gwRec)
                    {
                        logger.debug('[DVP-PhoneNumberTrunkService.AssignTrunkToProfile] - [%s] - get trunk PGSQL query success', reqId);
                        profRec.addTrunk(gwRec).then(function (result)
                        {
                            redisCacheHandler.addTrunkToCache(gwRec.id);
                            logger.debug('[DVP-PhoneNumberTrunkService.AssignTrunkToProfile] - [%s] - update trunk with profile PGSQL query success', reqId);
                            callback(undefined, true);

                        }).catch(function(err)
                        {
                            logger.error('[DVP-PhoneNumberTrunkService.AssignTrunkToProfile] - [%s] - update trunk with profile PGSQL query failed', reqId, err);
                            callback(err, false);
                        })
                    }
                    else
                    {
                        logger.debug('[DVP-PhoneNumberTrunkService.AssignTrunkToProfile] - [%s] - get trunk PGSQL query success', reqId);
                        callback(new Error('Trunk not found'), false);
                    }

                }).catch(function(err)
                {
                    logger.error('[DVP-PhoneNumberTrunkService.AssignTrunkToProfile] - [%s] - get trunk PGSQL query failed', reqId, err);
                    callback(err, false);
                })
            }
            else
            {
                logger.debug('[DVP-PhoneNumberTrunkService.AssignTrunkToProfile] - [%s] - get sip profile PGSQL query success', reqId);
                callback(new Error('Sip network profile not found'), false);
            }
         }).catch(function(err)
        {
            logger.error('[DVP-PhoneNumberTrunkService.AssignTrunkToProfile] - [%s] - get sip profile PGSQL query failed', reqId, err);
            callback(err, false);
        });
    }
    catch(ex)
    {
        logger.error('[DVP-PhoneNumberTrunkService.AssignTrunkToProfile] - [%s] - Exception occurred', reqId, ex);
        callback(ex, false);
    }

};

var UnAssignProfileFromTrunk = function(reqId, gwId, companyId, tenantId, callback)
{
    try
    {
        dbModel.Trunk.find({where: [{id: gwId},{CompanyId: companyId},{TenantId: tenantId}]}).then(function (gwRec)
        {
            if(gwRec)
            {
                gwRec.updateAttributes({ProfileId: null}).then(function (result)
                {
                    redisCacheHandler.addTrunkToCache(gwRec.id);
                    callback(null, true);

                }).catch(function(err)
                {
                    callback(err, false);
                })
            }
            else
            {
                callback(new Error('Trunk not found'), false);
            }

        }).catch(function(err)
        {
            callback(err, false);
        })
    }
    catch(ex)
    {
        logger.error('[DVP-PhoneNumberTrunkService.UnAssignProfileFromTrunk] - [%s] - Exception occurred', reqId, ex);
        callback(ex, false);
    }

};

var AssignTrunkToLoadBalancer = function(reqId, gwId, lbId, companyId, tenantId, callback)
{
    try
    {
        dbModel.LoadBalancer.find({where: [{id: lbId}]}).then(function (lbRec)
        {
            if(lbRec)
            {
                logger.debug('[DVP-PhoneNumberTrunkService.AssignTrunkToLoadBalancer] - [%s] - PGSQL get load balancer query success', reqId);
                dbModel.Trunk.find({where: [{id: gwId},{CompanyId : companyId},{TenantId : tenantId}]}).then(function (gwRec)
                {
                    if(gwRec)
                    {
                        logger.debug('[DVP-PhoneNumberTrunkService.AssignTrunkToLoadBalancer] - [%s] - PGSQL get trunk query success', reqId);

                        lbRec.addTrunk(gwRec).then(function (result)
                        {
                            redisCacheHandler.addTrunkToCache(gwRec.id);
                            logger.debug('[DVP-PhoneNumberTrunkService.AssignTrunkToLoadBalancer] - [%s] - PGSQL update trunk with loadbalancer id query success', reqId);
                            callback(undefined, true);

                        }).catch(function(err)
                        {
                            logger.error('[DVP-PhoneNumberTrunkService.AssignTrunkToLoadBalancer] - [%s] - PGSQL update trunk with loadbalancer id query failed', reqId, err);
                            callback(err, false);
                        })
                    }
                    else
                    {
                        logger.debug('[DVP-PhoneNumberTrunkService.AssignTrunkToLoadBalancer] - [%s] - PGSQL get trunk query success', reqId);
                        callback(new Error('Trunk Not Found'), false);
                    }

                }).catch(function(err)
                {
                    logger.error('[DVP-PhoneNumberTrunkService.AssignTrunkToLoadBalancer] - [%s] - PGSQL get trunk query failed', reqId, err);
                    callback(err, false);
                })
            }
            else
            {
                logger.debug('[DVP-PhoneNumberTrunkService.AssignTrunkToLoadBalancer] - [%s] - PGSQL get load balancer query success', reqId);
                callback(new Error('Load balancer not found'), false);
            }
        }).catch(function(err)
        {
            logger.error('[DVP-PhoneNumberTrunkService.AssignTrunkToLoadBalancer] - [%s] - PGSQL get load balancer query failed', reqId, err);
            callback(err, false);
        })
    }
    catch(ex)
    {
        logger.error('[DVP-PhoneNumberTrunkService.AssignTrunkToLoadBalancer] - [%s] - Exception occurred', reqId, ex);
        callback(ex, false);
    }

};

var UnAssignLoadBalancerFromTrunk = function(reqId, gwId, companyId, tenantId, callback)
{
    try
    {
        dbModel.Trunk.find({where: [{id: gwId},{CompanyId : companyId},{TenantId : tenantId}]}).then(function (gwRec)
        {
            if(gwRec)
            {
                logger.debug('[DVP-PhoneNumberTrunkService.UnAssignLoadBalancerFromTrunk] - [%s] - PGSQL get trunk query success', reqId);

                gwRec.updateAttributes({LoadBalancerId: null}).then(function (result)
                {
                    redisCacheHandler.addTrunkToCache(gwRec.id);
                    logger.debug('[DVP-PhoneNumberTrunkService.UnAssignLoadBalancerFromTrunk] - [%s] - PGSQL update trunk with loadbalancer id query success', reqId);
                    callback(undefined, true);

                }).catch(function(err)
                {
                    logger.error('[DVP-PhoneNumberTrunkService.UnAssignLoadBalancerFromTrunk] - [%s] - PGSQL update trunk with loadbalancer id query failed', reqId, err);
                    callback(err, false);
                })
            }
            else
            {
                logger.debug('[DVP-PhoneNumberTrunkService.UnAssignLoadBalancerFromTrunk] - [%s] - PGSQL get trunk query success', reqId);
                callback(new Error('Trunk Not Found'), false);
            }

        }).catch(function(err)
        {
            logger.error('[DVP-PhoneNumberTrunkService.UnAssignLoadBalancerFromTrunk] - [%s] - PGSQL get trunk query failed', reqId, err);
            callback(err, false);
        })
    }
    catch(ex)
    {
        logger.error('[DVP-PhoneNumberTrunkService.UnAssignLoadBalancerFromTrunk] - [%s] - Exception occurred', reqId, ex);
        callback(ex, false);
    }

};

var AssignTrunkTranslation = function(reqId, gwId, transId, companyId, tenantId, callback)
{
    try
    {
        dbModel.Translation.find({where: [{id: transId},{CompanyId: companyId},{TenantId: tenantId}]}).then(function (transRec)
        {
            if(transRec)
            {
                logger.debug('[DVP-PhoneNumberTrunkService.AssignTrunkTranslation] - [%s] - get translation PGSQL query success', reqId);

                dbModel.Trunk.find({where: [{id: gwId}]}).then(function (gwRec)
                {
                    if(gwRec)
                    {
                        logger.debug('[DVP-PhoneNumberTrunkService.AssignTrunkTranslation] - [%s] - get trunk PGSQL query success', reqId);

                        transRec.addTrunk(gwRec).then(function (result)
                        {
                            redisCacheHandler.addTrunkToCache(gwRec.id);
                            logger.debug('[DVP-PhoneNumberTrunkService.AssignTrunkTranslation] - [%s] - Update trunk with translation id PGSQL query success', reqId);
                            callback(undefined, true);

                        }).catch(function(err)
                        {
                            logger.error('[DVP-PhoneNumberTrunkService.AssignTrunkTranslation] - [%s] - Update trunk with translation id PGSQL query failed', reqId, err);
                            callback(err, false);
                        })
                    }
                    else
                    {
                        logger.debug('[DVP-PhoneNumberTrunkService.AssignTrunkTranslation] - [%s] - get trunk PGSQL query success', reqId);
                        callback(new Error('No trunk found'), false);
                    }

                }).catch(function(err)
                {
                    logger.error('[DVP-PhoneNumberTrunkService.AssignTrunkTranslation] - [%s] - get trunk PGSQL query failed', reqId, err);
                    callback(err, false);
                })
            }
            else
            {
                logger.debug('[DVP-PhoneNumberTrunkService.AssignTrunkTranslation] - [%s] - get translation PGSQL query success', reqId);
                callback(new Error('Translation not found'), false);

            }}).catch(function(err)
            {
                logger.error('[DVP-PhoneNumberTrunkService.AssignTrunkTranslation] - [%s] - get translation PGSQL query failed', reqId, err);
                callback(err, false);
            })
    }
    catch(ex)
    {
        logger.error('[DVP-PhoneNumberTrunkService.AssignTrunkTranslation] - [%s] - Exception occurred', reqId, ex);
        callback(ex, false);
    }

};

var UnAssignTrunkTranslation = function(reqId, gwId, companyId, tenantId, callback)
{
    try
    {
        dbModel.Trunk.find({where: [{id: gwId}]}).then(function (gwRec)
        {
            if(gwRec)
            {
                gwRec.updateAttributes({TranslationId: null}).then(function (result)
                {
                    redisCacheHandler.addTrunkToCache(gwRec.id);
                    callback(null, true);

                }).catch(function(err)
                {
                    callback(err, false);
                })
            }
            else
            {
                callback(new Error('No trunk found'), false);
            }

        }).catch(function(err)
        {
            callback(err, false);
        })
    }
    catch(ex)
    {
        logger.error('[DVP-PhoneNumberTrunkService.UnAssignTrunkTranslation] - [%s] - Exception occurred', reqId, ex);
        callback(ex, false);
    }

};

var AssignOperatorToTrunk = function(reqId, gwId, opId, companyId, tenantId, callback)
{
    try
    {
        dbModel.TrunkOperator.find({where: [{id: opId}]}).then(function (opRec)
        {
            if(opRec)
            {
                logger.debug('[DVP-PhoneNumberTrunkService.AssignOperatorToTrunk] - [%s] - Get operator PGSQL query success', reqId);

                dbModel.Trunk.find({where: [{id: gwId},{CompanyId: companyId},{TenantId: tenantId}]}).then(function (gwRec)
                {
                    if(gwRec)
                    {
                        logger.debug('[DVP-PhoneNumberTrunkService.AssignOperatorToTrunk] - [%s] - Get trunk PGSQL query success', reqId);

                        opRec.addTrunk(gwRec).then(function (result)
                        {
                            redisCacheHandler.addTrunkToCache(gwRec.id);
                            logger.debug('[DVP-PhoneNumberTrunkService.AssignOperatorToTrunk] - [%s] - Update trunk with operator Id PGSQL query success', reqId);
                            callback(undefined, true);

                        }).catch(function(err)
                        {
                            logger.error('[DVP-PhoneNumberTrunkService.AssignOperatorToTrunk] - [%s] - Update trunk with operator Id PGSQL query failed', reqId, err);
                            callback(err, false);
                        })
                    }
                    else
                    {
                        logger.debug('[DVP-PhoneNumberTrunkService.AssignOperatorToTrunk] - [%s] - Get trunk PGSQL query success', reqId);
                        callback(new Error('Trunk Not found'), false);
                    }

                }).catch(function(err)
                {
                    logger.error('[DVP-PhoneNumberTrunkService.AssignOperatorToTrunk] - [%s] - Get trunk PGSQL query failed', reqId, err);
                    callback(err, false);
                })
            }
            else
            {
                logger.debug('[DVP-PhoneNumberTrunkService.AssignOperatorToTrunk] - [%s] - Get operator PGSQL query success', reqId);
                callback(new Error('Operator Not found'), false);

            }}).catch(function(err)
            {
                logger.error('[DVP-PhoneNumberTrunkService.AssignOperatorToTrunk] - [%s] - Get operator PGSQL query failed', reqId, err);
                callback(err, false);
            })
    }
    catch(ex)
    {
        logger.error('[DVP-PhoneNumberTrunkService.AssignOperatorToTrunk] - [%s] - Exception occurred', reqId, ex);
        callback(ex, false);
    }

};

var AssignInboundLimitToTrunkNumberDB = function(reqId, trunkNumber, inboundLimitId, companyId, tenantId, callback)
{
    try
    {
        dbModel.TrunkPhoneNumber.find({where: [{PhoneNumber: trunkNumber},{CompanyId: companyId},{TenantId: tenantId}]}).then(function (phnNumRec)
        {
            if(phnNumRec)
            {
                logger.debug('[DVP-PhoneNumberTrunkService.AssignInboundLimitToTrunkNumberDB] - [%s] - Get trunk number PGSQL query success', reqId);

                dbModel.LimitInfo.find({where: [{LimitId: inboundLimitId},{CompanyId: companyId},{TenantId: tenantId}]}).then(function (limRec)
                {
                    if(limRec)
                    {
                        logger.debug('[DVP-PhoneNumberTrunkService.AssignInboundLimitToTrunkNumberDB] - [%s] - Get limit PGSQL query success', reqId);

                        phnNumRec.setLimitInfoInbound(limRec).then(function (updatedNumInfo)
                        {
                            if(updatedNumInfo)
                            {
                                redisCacheHandler.addTrunkNumberToCache(updatedNumInfo.PhoneNumber, updatedNumInfo);
                                redisCacheHandler.addTrunkNumberByIdToCache(updatedNumInfo.id, companyId, tenantId, updatedNumInfo);
                            }
                            logger.debug('[DVP-PhoneNumberTrunkService.AssignInboundLimitToTrunkNumberDB] - [%s] - Update phone number with inbound limit Id PGSQL query success', reqId);
                            callback(undefined, true);

                        }).catch(function(err)
                        {
                            logger.error('[DVP-PhoneNumberTrunkService.AssignInboundLimitToTrunkNumberDB] - [%s] - Update phone number with inbound limit Id PGSQL query failed', reqId, err);
                            callback(err, false);
                        })
                    }
                    else
                    {
                        logger.debug('[DVP-PhoneNumberTrunkService.AssignInboundLimitToTrunkNumberDB] - [%s] - Get limit PGSQL query success', reqId);
                        callback(new Error('Limit not found'), false);
                    }

                }).catch(function(err)
                {
                    logger.error('[DVP-PhoneNumberTrunkService.AssignInboundLimitToTrunkNumberDB] - [%s] - Get limit PGSQL query failed', reqId, err);
                    callback(err, false);
                })
            }
            else
            {
                logger.debug('[DVP-PhoneNumberTrunkService.AssignInboundLimitToTrunkNumberDB] - [%s] - Get trunk number PGSQL query success', reqId);
                callback(new Error('Trunk number not found'), false);

            }}).catch(function(err)
            {
                logger.error('[DVP-PhoneNumberTrunkService.AssignInboundLimitToTrunkNumberDB] - [%s] - Get trunk number PGSQL query failed', reqId, err);
                callback(err, false);
            })
    }
    catch(ex)
    {
        logger.error('[DVP-PhoneNumberTrunkService.AssignInboundLimitToTrunkNumberDB] - [%s] - Exception occurred', reqId, ex);
        callback(ex, false);
    }

};

var AssignOutboundLimitToTrunkNumberDB = function(reqId, trunkNumber, outboundLimitId, companyId, tenantId, callback)
{
    try
    {
        dbModel.TrunkPhoneNumber.find({where: [{PhoneNumber: trunkNumber},{CompanyId: companyId},{TenantId: tenantId}]}).then(function (phnNumRec)
        {
            if(phnNumRec)
            {
                logger.debug('[DVP-PhoneNumberTrunkService.AssignOutboundLimitToTrunkNumberDB] - [%s] - Get trunk number PGSQL query success', reqId);

                dbModel.LimitInfo.find({where: [{LimitId: outboundLimitId},{CompanyId: companyId},{TenantId: tenantId}]}).complete(function (err, limRec)
                {
                    if(err)
                    {
                        logger.error('[DVP-PhoneNumberTrunkService.AssignOutboundLimitToTrunkNumberDB] - [%s] - Get limit PGSQL query failed', reqId, err);
                        callback(err, false);
                    }
                    else if(limRec)
                    {
                        logger.debug('[DVP-PhoneNumberTrunkService.AssignOutboundLimitToTrunkNumberDB] - [%s] - Get limit PGSQL query success', reqId);

                        phnNumRec.setLimitInfoOutbound(limRec).then(function (updatedNumInfo)
                        {
                            if(updatedNumInfo)
                            {
                                redisCacheHandler.addTrunkNumberToCache(updatedNumInfo.PhoneNumber, updatedNumInfo);
                                redisCacheHandler.addTrunkNumberByIdToCache(updatedNumInfo.id, companyId, tenantId, updatedNumInfo);

                            }
                            logger.debug('[DVP-PhoneNumberTrunkService.AssignOutboundLimitToTrunkNumberDB] - [%s] - Update phone number with outbound limit Id PGSQL query success', reqId);
                            callback(undefined, true);

                        }).catch(function(err)
                        {
                            logger.error('[DVP-PhoneNumberTrunkService.AssignOutboundLimitToTrunkNumberDB] - [%s] - Update phone number with outbound limit Id PGSQL query failed', reqId, err);
                            callback(err, false);
                        })
                    }
                    else
                    {
                        logger.debug('[DVP-PhoneNumberTrunkService.AssignOutboundLimitToTrunkNumberDB] - [%s] - Get limit PGSQL query success', reqId);
                        callback(new Error('Trunk Not found'), false);
                    }

                })
            }
            else
            {
                logger.debug('[DVP-PhoneNumberTrunkService.AssignOutboundLimitToTrunkNumberDB] - [%s] - Get trunk number PGSQL query success', reqId);
                callback(new Error('Operator Not found'), false);

            }}).catch(function(err)
            {
                logger.error('[DVP-PhoneNumberTrunkService.AssignOutboundLimitToTrunkNumberDB] - [%s] - Get trunk number PGSQL query failed', reqId, err);
                callback(err, false);
            })
    }
    catch(ex)
    {
        logger.error('[DVP-PhoneNumberTrunkService.AssignOutboundLimitToTrunkNumberDB] - [%s] - Exception occurred', reqId, ex);
        callback(ex, false);
    }

};

var AssignBothLimitToTrunkNumberDB = function(reqId, trunkNumber, bothLimitId, companyId, tenantId, callback)
{
    try
    {
        dbModel.TrunkPhoneNumber.find({where: [{PhoneNumber: trunkNumber},{CompanyId: companyId},{TenantId: tenantId}]}).then(function (phnNumRec)
        {
            if(phnNumRec)
            {
                logger.debug('[DVP-PhoneNumberTrunkService.AssignBothLimitToTrunkNumberDB] - [%s] - Get trunk number PGSQL query success', reqId);

                dbModel.LimitInfo.find({where: [{LimitId: bothLimitId},{CompanyId: companyId},{TenantId: tenantId}]}).then(function (limRec)
                {
                    if(limRec)
                    {
                        logger.debug('[DVP-PhoneNumberTrunkService.AssignBothLimitToTrunkNumberDB] - [%s] - Get limit PGSQL query success', reqId);

                        phnNumRec.setLimitInfoBoth(limRec).then(function (updatedNumInfo)
                        {
                            if(updatedNumInfo)
                            {
                                redisCacheHandler.addTrunkNumberToCache(updatedNumInfo.PhoneNumber, updatedNumInfo);
                                redisCacheHandler.addTrunkNumberByIdToCache(updatedNumInfo.id, companyId, tenantId, updatedNumInfo);
                            }
                            logger.debug('[DVP-PhoneNumberTrunkService.AssignBothLimitToTrunkNumberDB] - [%s] - Update phone number with both limit Id PGSQL query success', reqId);
                            callback(undefined, true);

                        }).catch(function(err)
                        {
                            logger.error('[DVP-PhoneNumberTrunkService.AssignBothLimitToTrunkNumberDB] - [%s] - Update phone number with both limit Id PGSQL query failed', reqId, err);
                            callback(err, false);
                        })
                    }
                    else
                    {
                        logger.debug('[DVP-PhoneNumberTrunkService.AssignBothLimitToTrunkNumberDB] - [%s] - Get limit PGSQL query success', reqId);
                        callback(new Error('Trunk Not found'), false);
                    }

                }).catch(function(err)
                {
                    logger.error('[DVP-PhoneNumberTrunkService.AssignBothLimitToTrunkNumberDB] - [%s] - Get limit PGSQL query failed', reqId, err);
                    callback(err, false);
                })
            }
            else
            {
                logger.debug('[DVP-PhoneNumberTrunkService.AssignBothLimitToTrunkNumberDB] - [%s] - Get trunk number PGSQL query success', reqId);
                callback(new Error('Operator Not found'), false);

            }}).catch(function(err)
            {
                logger.error('[DVP-PhoneNumberTrunkService.AssignBothLimitToTrunkNumberDB] - [%s] - Get trunk number PGSQL query failed', reqId, err);
                callback(err, false);
            })
    }
    catch(ex)
    {
        logger.error('[DVP-PhoneNumberTrunkService.AssignBothLimitToTrunkNumberDB] - [%s] - Exception occurred', reqId, ex);
        callback(ex, false);
    }

};

var AddTrunkConfigurationDB = function(reqId, gwInfo, companyId, tenantId, callback)
{
    try
    {

        var gwData = {
            TrunkCode: gwInfo.TrunkCode,
            TrunkName: gwInfo.TrunkName,
            ObjClass: gwInfo.ObjClass,
            ObjType: gwInfo.ObjType,
            ObjCategory: gwInfo.ObjCategory,
            IpUrl: gwInfo.IpUrl,
            Enable: gwInfo.Enable,
            CompanyId: companyId,
            TenantId: tenantId,
            FaxType: gwInfo.FaxType,
            TranslationId: gwInfo.TranslationId,
            Username: gwInfo.Username,
            Password: gwInfo.Password
        };

        if(gwInfo.Codecs)
        {
            gwData.Codecs = JSON.stringify(gwInfo.Codecs);
        }

        var gw = dbModel.Trunk.build(gwData);

        gw
            .save()
            .then(function (rslt)
            {
                redisCacheHandler.addTrunkToCache(gw.id);
                logger.debug('[DVP-PhoneNumberTrunkService.AddTrunkConfigurationDB] - [%s] - Insert Trunk PGSQL query success', reqId);
                var gwId = gw.id;
                callback(undefined, gwId, true);

            }).catch(function(err)
            {
                logger.error('[DVP-PhoneNumberTrunkService.AddTrunkConfigurationDB] - [%s] - Exception occurred', reqId, err);
                callback(err, -1, false);
            })

    }
    catch(ex)
    {
        logger.error('[DVP-PhoneNumberTrunkService.AddTrunkConfigurationDB] - [%s] - Exception occurred', reqId, ex);
        callback(ex, -1, false);
    }
};

var AddTrunkOperator = function(reqId, opInfo, companyId, tenantId, callback)
{
    try {

        var op = dbModel.TrunkOperator.build({
            OperatorName: opInfo.OperatorName,
            OperatorCode: opInfo.OperatorCode,
            ObjClass: opInfo.ObjClass,
            ObjType: opInfo.ObjType,
            ObjCategory: opInfo.ObjCategory,
            CompanyId: companyId,
            TenantId: tenantId
        });

        op
            .save()
            .then(function (rslt)
            {
                    logger.debug('[DVP-PhoneNumberTrunkService.AddTrunkOperator] - [%s] - insert trunk operator PGSQL query success', reqId);
                    var opId = op.id;
                    callback(undefined, opId, true);

            }).catch(function(err)
            {
                logger.error('[DVP-PhoneNumberTrunkService.AddTrunkOperator] - [%s] - insert trunk operator PGSQL query failed', reqId, err);
                callback(err, -1, false);
            })

    }
    catch(ex)
    {
        logger.error('[DVP-PhoneNumberTrunkService.AddTrunkOperator] - [%s] - Exception occurred', reqId, ex);
        callback(ex, -1, false);
    }
};

var AddTrunkIpAddress = function(reqId, trunkId, ipInfo, companyId, tenantId, callback)
{
    try
    {
        dbModel.Trunk.find({where: [{id: trunkId}, {CompanyId: companyId}, {TenantId: tenantId}]}).then(function (trObj)
        {
            if (trObj)
            {
                var trIp = dbModel.TrunkIpAddress.build({
                    IpAddress: ipInfo.IpAddress,
                    Mask: ipInfo.Mask,
                    CompanyId: companyId,
                    TenantId: tenantId,
                    TrunkId: trunkId
                });

                trIp
                    .save()
                    .then(function (rslt)
                    {
                        redisCacheHandler.addTrunkToCache(trunkId);
                        callback(undefined, trIp);

                    }).catch(function (err)
                    {
                        logger.error('[DVP-PhoneNumberTrunkService.AddTrunkIpAddress] - [%s] - insert trunk ipaddress PGSQL query failed', reqId, err);
                        callback(err, undefined);
                    })
            }
            else
            {
                callback(new Error("Trunk Not Found for Given Id"), undefined);
            }
        }).catch(function (err)
        {
            logger.error('[DVP-PhoneNumberTrunkService.AddTrunkIpAddress] - [%s] - PGSQL get trunk query failed', reqId, err);
            callback(err, undefined);
        })


    }
    catch(ex)
    {
        logger.error('[DVP-PhoneNumberTrunkService.AddTrunkIpAddress] - [%s] - Exception occurred', reqId, ex);
        callback(ex, undefined);
    }
};

var UpdateTrunkConfigurationDB = function(reqId, trunkId, trunkInfo, companyId, tenantId, callback)
{
    try
    {
        dbModel.Trunk.find({where:[{ id: trunkId },{ CompanyId: companyId },{ TenantId: tenantId }]}).then(function(gwObj)
        {
            if(gwObj)
            {

                logger.debug('[DVP-PhoneNumberTrunkService.UpdateTrunkConfigurationDB] - [%s] - PGSQL get trunk query success', reqId);
                //update
                var gwData = {TrunkName: trunkInfo.TrunkName, Enable: trunkInfo.Enable, ObjClass: trunkInfo.ObjClass, IpUrl: trunkInfo.IpUrl, ObjType: trunkInfo.ObjType, ObjCategory: trunkInfo.ObjCategory, FaxType: trunkInfo.FaxType, TranslationId: trunkInfo.TranslationId, Username: trunkInfo.Username, Password: trunkInfo.Password};

                if(trunkInfo.Codecs)
                {
                    gwData.Codecs = JSON.stringify(trunkInfo.Codecs);
                }

                gwObj.updateAttributes(gwData).then(function (upRes)
                {
                    redisCacheHandler.addTrunkToCache(trunkId);
                    logger.debug('[DVP-PhoneNumberTrunkService.UpdateTrunkConfigurationDB] - [%s] - PGSQL update trunk query success', reqId);
                    callback(undefined, upRes);

                }).catch(function(err)
                {
                    logger.error('[DVP-PhoneNumberTrunkService.UpdateTrunkConfigurationDB] - [%s] - PGSQL update trunk query failed', reqId, err);
                    callback(err, null);
                })
            }
            else
            {
                callback(new Error("Trunk Not Found for Given Id"), null);
            }
        }).catch(function(err)
        {
            logger.error('[DVP-PhoneNumberTrunkService.UpdateTrunkConfigurationDB] - [%s] - PGSQL get trunk query failed', reqId, err);
            callback(err, null);
        })
    }
    catch(ex)
    {
        logger.error('[DVP-PhoneNumberTrunkService.UpdateTrunkConfigurationDB] - [%s] - Exception occurred', reqId, ex);
        callback(ex, null);
    }
};

var RemovePhoneNumberDB = function(reqId, phoneNumber, companyId, tenantId, callback)
{
    try
    {
        dbModel.TrunkPhoneNumber.find({where: [{PhoneNumber: phoneNumber}, {CompanyId: companyId}, {TenantId: tenantId}]}).then(function (phnNum)
        {

                logger.debug('[DVP-PhoneNumberTrunkService.RemovePhoneNumberDB] - [%s] - get phone number PGSQL query success', reqId);
                if(phnNum)
                {
                    phnNum.destroy().then(function (rslt)
                    {
                        redisCacheHandler.removeTrunkNumberFromCache(phnNum.PhoneNumber);
                        redisCacheHandler.removeTrunkNumberByIdFromCache(phnNum.id, companyId, tenantId);

                        logger.debug('[DVP-PhoneNumberTrunkService.RemovePhoneNumberDB] - [%s] - delete phone number PGSQL query success', reqId);
                        callback(undefined, true);

                    }).catch(function(err)
                    {
                        logger.error('[DVP-PhoneNumberTrunkService.RemovePhoneNumberDB] - [%s] - delete phone number PGSQL query failed', reqId, err);
                        callback(err, false);
                    });
                }
                else
                {
                    callback(new Error('Cannot find a phone number for the company'), false);
                }


        }).catch(function(err)
        {
            logger.error('[DVP-PhoneNumberTrunkService.RemovePhoneNumberDB] - [%s] - get phone number PGSQL query failed', reqId, err);
            callback(err, false);
        });

    }
    catch(ex)
    {
        logger.error('[DVP-PhoneNumberTrunkService.RemovePhoneNumberDB] - [%s] - Exception occurred', reqId, ex);
        callback(ex, false);
    }
};

var RemoveIpAddress = function(reqId, ipAddressId, companyId, tenantId, trunkId, callback)
{
    try
    {
        dbModel.TrunkIpAddress.find({where: [{id: ipAddressId}, {CompanyId: companyId}, {TenantId: tenantId}]}).then(function (ipAddr)
        {
            if(ipAddr)
            {
                ipAddr.destroy().then(function (rslt)
                {
                    redisCacheHandler.addTrunkToCache(trunkId);
                    callback(undefined, true);

                }).catch(function(err)
                {
                    logger.error('[DVP-PhoneNumberTrunkService.RemoveIpAddress] - [%s] - delete ip address PGSQL query failed', reqId, err);
                    callback(err, false);
                });
            }
            else
            {
                callback(new Error('Cannot find a phone number for the company'), false);
            }


        }).catch(function(err)
        {
            logger.error('[DVP-PhoneNumberTrunkService.RemoveIpAddress] - [%s] - get ip address PGSQL query failed', reqId, err);
            callback(err, false);
        });

    }
    catch(ex)
    {
        logger.error('[DVP-PhoneNumberTrunkService.RemoveIpAddress] - [%s] - Exception occurred', reqId, ex);
        callback(ex, false);
    }
};

var AddPhoneNumbersToTrunkDB = function(reqId, phoneNumberInfo, companyId, tenantId, callback)
{
    try
    {
        if(phoneNumberInfo)
        {
            dbModel.Trunk.find({where: [{id: phoneNumberInfo.TrunkId}, {CompanyId: companyId}, {TenantId: tenantId}]}).then(function (gwObj)
            {
                try
                {
                    if (gwObj)
                    {
                        logger.debug('[DVP-PhoneNumberTrunkService.AddPhoneNumbersToTrunkDB] - [%s] - Get Trunk PGSQL query success', reqId);

                        dbModel.TrunkPhoneNumber.find({where: [{PhoneNumber: phoneNumberInfo.PhoneNumber}]}).then(function (phnNum)
                        {
                            if(phnNum)
                            {
                                logger.debug('[DVP-PhoneNumberTrunkService.AddPhoneNumbersToTrunkDB] - [%s] - Get Trunk number PGSQL query success', reqId);

                                if(phnNum.CompanyId == companyId)
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
                                    CompanyId: companyId,
                                    TenantId: tenantId,
                                    TrunkId: phoneNumberInfo.TrunkId,
                                    InboundLimitId: phoneNumberInfo.InboundLimitId,
                                    OutboundLimitId: phoneNumberInfo.OutboundLimitId,
                                    BothLimitId: phoneNumberInfo.BothLimitId
                                });

                                phoneNum
                                    .save()
                                    .then(function (rsltd)
                                    {
                                        callback(undefined, phoneNum.id, true);

                                    }).catch(function(err)
                                    {
                                        logger.error('[DVP-PhoneNumberTrunkService.AddPhoneNumbersToTrunkDB] - [%s] - Insert phone number PGSQL query failed', reqId, err);
                                        callback(err, -1, false);
                                    })

                            }

                        }).catch(function(err)
                        {
                            logger.error('[DVP-PhoneNumberTrunkService.AddPhoneNumbersToTrunkDB] - [%s] - Get Trunk number PGSQL query failed', reqId, err);
                            callback(err, -1, false);
                        });


                    }
                    else
                    {
                        logger.debug('[DVP-PhoneNumberTrunkService.AddPhoneNumbersToTrunkDB] - [%s] - Get Trunk PGSQL query success', reqId);
                        callback(new Error("Trunk Not Found for Given Id and Company"), -1, false);
                    }
                }
                catch(ex)
                {
                    callback(ex, -1, false);
                }

            }).catch(function(err)
            {
                logger.error('[DVP-PhoneNumberTrunkService.AddPhoneNumbersToTrunkDB] - [%s] - Get Trunk PGSQL query failed', reqId, err);
                callback(err, -1, false);
            })
        }
        else
        {
            callback(new Error("Empty phone number info"), -1, false);
        }
    }
    catch(ex)
    {
        logger.error('[DVP-PhoneNumberTrunkService.AddPhoneNumbersToTrunkDB] - [%s] - Exception occurred', reqId, ex);
        callback(ex, -1, false);
    }
};


var AddPhoneNumbersToAnyTrunkDB = function(reqId, phoneNumberInfo, companyId, tenantId, callback)
{
    try
    {
        if(phoneNumberInfo)
        {
            dbModel.Trunk.find({where: [{id: phoneNumberInfo.TrunkId}]}).then(function (gwObj)
            {
                try
                {
                    if (gwObj)
                    {
                        logger.debug('[DVP-PhoneNumberTrunkService.AddPhoneNumbersToAnyTrunkDB] - [%s] - Get Trunk PGSQL query success', reqId);

                        dbModel.TrunkPhoneNumber.find({where: [{PhoneNumber: phoneNumberInfo.PhoneNumber}]}).then(function (phnNum)
                        {
                            if(phnNum)
                            {
                                logger.debug('[DVP-PhoneNumberTrunkService.AddPhoneNumbersToAnyTrunkDB] - [%s] - Get Trunk number PGSQL query success', reqId);

                                if(phnNum.CompanyId == companyId)
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
                                    CompanyId: companyId,
                                    TenantId: tenantId,
                                    TrunkId: phoneNumberInfo.TrunkId,
                                    InboundLimitId: phoneNumberInfo.InboundLimitId,
                                    OutboundLimitId: phoneNumberInfo.OutboundLimitId,
                                    BothLimitId: phoneNumberInfo.BothLimitId
                                });

                                phoneNum
                                    .save()
                                    .then(function (rsltd)
                                    {
                                        callback(undefined, phoneNum.id, true);

                                    }).catch(function(err)
                                {
                                    logger.error('[DVP-PhoneNumberTrunkService.AddPhoneNumbersToAnyTrunkDB] - [%s] - Insert phone number PGSQL query failed', reqId, err);
                                    callback(err, -1, false);
                                })

                            }

                        }).catch(function(err)
                        {
                            logger.error('[DVP-PhoneNumberTrunkService.AddPhoneNumbersToAnyTrunkDB] - [%s] - Get Trunk number PGSQL query failed', reqId, err);
                            callback(err, -1, false);
                        });


                    }
                    else
                    {
                        logger.debug('[DVP-PhoneNumberTrunkService.AddPhoneNumbersToAnyTrunkDB] - [%s] - Get Trunk PGSQL query success', reqId);
                        callback(new Error("Trunk Not Found for Given Id"), -1, false);
                    }
                }
                catch(ex)
                {
                    callback(ex, -1, false);
                }

            }).catch(function(err)
            {
                logger.error('[DVP-PhoneNumberTrunkService.AddPhoneNumbersToAnyTrunkDB] - [%s] - Get Trunk PGSQL query failed', reqId, err);
                callback(err, -1, false);
            })
        }
        else
        {
            callback(new Error("Empty phone number info"), -1, false);
        }
    }
    catch(ex)
    {
        logger.error('[DVP-PhoneNumberTrunkService.AddPhoneNumbersToAnyTrunkDB] - [%s] - Exception occurred', reqId, ex);
        callback(ex, -1, false);
    }
};


var GetUnallocatedPhoneNumbersForOperator = function(reqId, operatorId, companyId, tenantId, callback)
{
    try
    {

        dbModel.TrunkOperator.find({where: [{id: operatorId}, {CompanyId: companyId}, {TenantId: tenantId}], include : [{model: dbModel.Trunk, as : "Trunk", include : [{model: dbModel.TrunkPhoneNumber, as: "TrunkPhoneNumber", where : [{CompanyId : companyId}, {TenantId: tenantId}]}]}]}).then(function (result)
        {
            logger.debug('[DVP-PhoneNumberTrunkService.GetUnallocatedPhoneNumbersForOperator] - [%s] - PGSQL query success', reqId);

            callback(undefined, result);

        }).catch(function(err)
        {
            logger.error('[DVP-PhoneNumberTrunkService.GetUnallocatedPhoneNumbersForOperator] - [%s] - PGSQL query failed', reqId, err);
            callback(err, undefined);
        })

    }
    catch(ex)
    {
        logger.error('[DVP-PhoneNumberTrunkService.GetUnallocatedPhoneNumbersForOperator] - [%s] - Exception occurred', reqId, ex);
        callback(ex, undefined);
    }
};

var GetLoadbalancerForCloud = function(reqId, cloudId, companyId, tenantId, callback)
{
    try
    {

        dbModel.Cloud.find({where: [{id: cloudId}, {CompanyId: companyId}, {TenantId: tenantId}], include : [{model: dbModel.LoadBalancer, as : "LoadBalancer"}]}).then(function (result)
        {
            logger.debug('[DVP-PhoneNumberTrunkService.GetUnallocatedPhoneNumbersForOperator] - [%s] - PGSQL query success', reqId);

            callback(undefined, result);

        }).catch(function(err)
        {
            logger.error('[DVP-PhoneNumberTrunkService.GetUnallocatedPhoneNumbersForOperator] - [%s] - PGSQL query failed', reqId, err);
            callback(err, undefined);
        })

    }
    catch(ex)
    {
        logger.error('[DVP-PhoneNumberTrunkService.GetUnallocatedPhoneNumbersForOperator] - [%s] - Exception occurred', reqId, ex);
        callback(ex, undefined);
    }
};

var GetLoadbalancerForTenant = function(reqId, companyId, tenantId, callback)
{
    try
    {

        dbModel.Cloud.find({where: [{CompanyId: companyId}, {TenantId: tenantId}], include : [{model: dbModel.LoadBalancer, as : "LoadBalancer"}]}).then(function (result)
        {
            logger.debug('[DVP-PhoneNumberTrunkService.GetUnallocatedPhoneNumbersForOperator] - [%s] - PGSQL query success', reqId);

            callback(undefined, result);

        }).catch(function(err)
        {
            logger.error('[DVP-PhoneNumberTrunkService.GetUnallocatedPhoneNumbersForOperator] - [%s] - PGSQL query failed', reqId, err);
            callback(err, undefined);
        })

    }
    catch(ex)
    {
        logger.error('[DVP-PhoneNumberTrunkService.GetUnallocatedPhoneNumbersForOperator] - [%s] - Exception occurred', reqId, ex);
        callback(ex, undefined);
    }
};



var GetAllocatedPhoneNumbersForOperator = function(reqId, operatorId, companyId, tenantId, callback)
{
    try
    {

        dbModel.TrunkOperator.find({where: [{id: operatorId}, {CompanyId: companyId}, {TenantId: tenantId}], include : [{model: dbModel.Trunk, as : "Trunk", include : [{model: dbModel.TrunkPhoneNumber, as: "TrunkPhoneNumber", where : [dbModel.SequelizeConn.or({CompanyId : {not: companyId }}, {TenantId: {not: tenantId }})]}]}]}).then(function (result)
        {

            logger.debug('[DVP-PhoneNumberTrunkService.GetAllocatedPhoneNumbersForOperator] - [%s] - PGSQL query success', reqId);

            callback(undefined, result);

        }).catch(function(err)
        {
            logger.error('[DVP-PhoneNumberTrunkService.GetAllocatedPhoneNumbersForOperator] - [%s] - PGSQL query failed', reqId, err);
            callback(err, undefined);
        })

    }
    catch(ex)
    {
        logger.error('[DVP-PhoneNumberTrunkService.GetAllocatedPhoneNumbersForOperator] - [%s] - Exception occurred', reqId, ex);
        callback(ex, undefined);
    }
};


var GetTrunkOperatorByOperatorCode = function(operatorCode, callback)
{
    try
    {

        dbModel.TrunkOperator.find({where: [{OperatorCode: operatorCode}]}).then(function (result)
        {

            logger.debug('[DVP-PhoneNumberTrunkService.GetTrunkOperatorByOperatorCode] - [%s] - PGSQL query success', operatorCode);

            callback(undefined, result);

        }).catch(function(err)
        {
            logger.error('[DVP-PhoneNumberTrunkService.GetTrunkOperatorByOperatorCode] - [%s] - PGSQL query failed', operatorCode, err);
            callback(err, undefined);
        })

    }
    catch(ex)
    {
        logger.error('[DVP-PhoneNumberTrunkService.GetTrunkOperatorByOperatorCode] - [%s] - Exception occurred', operatorCode, ex);
        callback(ex, undefined);
    }
};

module.exports.AddTrunkConfigurationDB = AddTrunkConfigurationDB;
module.exports.AssignTrunkToLoadBalancer = AssignTrunkToLoadBalancer;
module.exports.SetTrunkEnabledStatusDB = SetTrunkEnabledStatusDB;
module.exports.GetTrunkByIdDB = GetTrunkByIdDB;
module.exports.UpdateTrunkConfigurationDB = UpdateTrunkConfigurationDB;
module.exports.SwitchPhoneNumberCompanyDB = SwitchPhoneNumberCompanyDB;
module.exports.RemovePhoneNumberDB = RemovePhoneNumberDB;
module.exports.AddPhoneNumbersToTrunkDB = AddPhoneNumbersToTrunkDB;
module.exports.AddPhoneNumbersToAnyTrunkDB = AddPhoneNumbersToAnyTrunkDB;
module.exports.AssignTrunkToProfile = AssignTrunkToProfile;
module.exports.AssignTrunkTranslation = AssignTrunkTranslation;
module.exports.AddTrunkOperator = AddTrunkOperator;
module.exports.AssignOperatorToTrunk = AssignOperatorToTrunk;
module.exports.GetCallServerByProfileIdDB = GetCallServerByProfileIdDB;
module.exports.GetCallServersRelatedToLoadBalancerDB = GetCallServersRelatedToLoadBalancerDB;
module.exports.GetUnallocatedPhoneNumbersForOperator = GetUnallocatedPhoneNumbersForOperator;
module.exports.GetAllocatedPhoneNumbersForOperator = GetAllocatedPhoneNumbersForOperator;
module.exports.AssignInboundLimitToTrunkNumberDB = AssignInboundLimitToTrunkNumberDB;
module.exports.AssignOutboundLimitToTrunkNumberDB = AssignOutboundLimitToTrunkNumberDB;
module.exports.AssignBothLimitToTrunkNumberDB = AssignBothLimitToTrunkNumberDB;
module.exports.GetTrunkListDB = GetTrunkListDB;
module.exports.GetLoadbalancerForCloud = GetLoadbalancerForCloud;
module.exports.AddTrunkIpAddress = AddTrunkIpAddress;
module.exports.GetTrunkIpAddressList = GetTrunkIpAddressList;
module.exports.RemoveIpAddress = RemoveIpAddress;
module.exports.GetTrunkOperatorByOperatorCode = GetTrunkOperatorByOperatorCode;
module.exports.GetPhoneNumbersOfTrunk = GetPhoneNumbersOfTrunk;
module.exports.AddPhoneNumberToClientCompany = AddPhoneNumberToClientCompany;
module.exports.UpdatePhoneNumberToClientCompany = UpdatePhoneNumberToClientCompany;
module.exports.GetLoadbalancerForTenant = GetLoadbalancerForTenant;
module.exports.GetPhoneNumber = GetPhoneNumber;
module.exports.UnAssignLoadBalancerFromTrunk= UnAssignLoadBalancerFromTrunk;
module.exports.UnAssignProfileFromTrunk = UnAssignProfileFromTrunk;
module.exports.UnAssignTrunkTranslation = UnAssignTrunkTranslation;
module.exports.DbConn = dbModel.SequelizeConn;

