/**
 * Created by dinusha on 11/10/2016.
 */

var Promise = require('bluebird');
var config = require('config');
var util = require('util');
var logger = require('dvp-common/LogHandler/CommonLogHandler.js').logger;
var httpReq = require('request');
var validator = require('validator');

var addNewLimit = function(reqId, phoneNumber, description, maxLimit, companyId, tenantId)
{
    return new Promise(function(resolve, reject)
    {
        try
        {
            var securityToken = config.Token;

            securityToken = 'bearer ' + securityToken;

            var limitServiceHost = config.Services.limitServiceHost;
            var limitServicePort = config.Services.limitServicePort;
            var limitServiceVersion = config.Services.limitServiceVersion;
            var compInfo = tenantId + ':' + companyId;

            logger.debug('[DVP-PhoneNumberTrunkService.AddNewLimit] - [%s] -  Calling Limit API to Add Limit', reqId);

            if(limitServiceHost && limitServiceVersion)
            {
                var httpUrl = util.format('http://%s/DVP/API/%s/LimitAPI/Limit', limitServiceHost, limitServiceVersion);

                if(config.Services.dynamicPort || validator.isIP(limitServiceHost))
                {
                    httpUrl = util.format('http://%s:%s/DVP/API/%s/LimitAPI/Limit', limitServiceHost, limitServicePort, limitServiceVersion);
                }

                var obj = {
                    MaxCount: maxLimit,
                    LimitDescription: description,
                    Enable: true
                };

                var payload = JSON.stringify(obj);

                var options = {
                    url: httpUrl,
                    method: 'POST',
                    headers: {
                        'authorization': securityToken,
                        'companyinfo': compInfo,
                        'content-type': 'application/json'
                    },
                    body: payload
                };

                logger.debug('[DVP-PhoneNumberTrunkService.AddNewLimit] - [%s] - Creating Api Url : %s', reqId, httpUrl);


                httpReq(options, function (error, response, body)
                {
                    if (!error && response.statusCode == 200)
                    {
                        var apiResp = JSON.parse(body);

                        if(apiResp && apiResp.Result)
                        {
                            resolve(apiResp.Result);
                        }
                        else
                        {
                            reject(apiResp.Exception);
                        }

                        logger.debug('[DVP-PhoneNumberTrunkService.AddNewLimit] - [%s] - Limit Api returned : %s', reqId, body);


                    }
                    else
                    {
                        logger.error('[DVP-PhoneNumberTrunkService.AddNewLimit] - [%s] - Limit Api call failed', reqId, error);
                        reject(error);
                    }
                })
            }
            else
            {
                logger.error('[DVP-PhoneNumberTrunkService.AddNewLimit] - [%s] - Limit api service ip, port or version not set', reqId);
                reject(new Error('Limit api service ip, port or version not set'));
            }
        }
        catch(ex)
        {
            logger.error('[DVP-PhoneNumberTrunkService.AddNewLimit] - [%s] - Exception occurred', reqId, ex);
            reject(ex);
        }
    })


};

var addNewLimitCallback = function(reqId, phoneNumber, description, maxLimit, companyId, tenantId, callback)
{
    try
    {
        var securityToken = config.Token;

        securityToken = 'bearer ' + securityToken;

        var limitServiceHost = config.Services.limitServiceHost;
        var limitServicePort = config.Services.limitServicePort;
        var limitServiceVersion = config.Services.limitServiceVersion;
        var compInfo = tenantId + ':' + companyId;

        logger.debug('[DVP-PhoneNumberTrunkService.AddNewLimit] - [%s] -  Calling Limit API to Add Limit', reqId);

        if(limitServiceHost && limitServiceVersion)
        {
            var httpUrl = util.format('http://%s/DVP/API/%s/LimitAPI/Limit', limitServiceHost, limitServiceVersion);

            if(config.Services.dynamicPort || validator.isIP(limitServiceHost))
            {
                httpUrl = util.format('http://%s:%s/DVP/API/%s/LimitAPI/Limit', limitServiceHost, limitServicePort, limitServiceVersion);
            }

            var obj = {
                MaxCount: maxLimit,
                LimitDescription: description,
                Enable: true
            };

            var payload = JSON.stringify(obj);

            var options = {
                url: httpUrl,
                method: 'POST',
                headers: {
                    'authorization': securityToken,
                    'companyinfo': compInfo,
                    'content-type': 'application/json'
                },
                body: payload
            };

            logger.debug('[DVP-PhoneNumberTrunkService.AddNewLimit] - [%s] - Creating Api Url : %s', reqId, httpUrl);


            httpReq(options, function (error, response, body)
            {
                if (!error && response.statusCode == 200)
                {
                    var apiResp = JSON.parse(body);

                    if(apiResp && apiResp.Result)
                    {
                        callback(null, apiResp.Result);
                    }
                    else
                    {
                        callback(apiResp.Exception, null);
                    }

                    logger.debug('[DVP-PhoneNumberTrunkService.AddNewLimit] - [%s] - Limit Api returned : %s', reqId, body);


                }
                else
                {
                    logger.error('[DVP-PhoneNumberTrunkService.AddNewLimit] - [%s] - Limit Api call failed', reqId, error);
                    callback(error, null);
                }
            })
        }
        else
        {
            logger.error('[DVP-PhoneNumberTrunkService.AddNewLimit] - [%s] - Limit api service ip, port or version not set', reqId);
            callback(new Error('Limit api service ip, port or version not set'), null);
        }
    }
    catch(ex)
    {
        logger.error('[DVP-PhoneNumberTrunkService.AddNewLimit] - [%s] - Exception occurred', reqId, ex);
        callback(ex, null);
    }


};

var updateLimitCompSwitchCallback = function(reqId, limitId, maxLimit, companyId, tenantId, callback)
{
    try
    {
        var securityToken = config.Token;

        securityToken = 'bearer ' + securityToken;

        var limitServiceHost = config.Services.limitServiceHost;
        var limitServicePort = config.Services.limitServicePort;
        var limitServiceVersion = config.Services.limitServiceVersion;
        var compInfo = tenantId + ':' + companyId;

        logger.debug('[DVP-PhoneNumberTrunkService.updateLimitCompSwitchCallback] - [%s] -  Calling Limit API to Add Limit', reqId);

        if(limitServiceHost && limitServiceVersion)
        {
            var httpUrl = util.format('http://%s/DVP/API/%s/LimitAPI/SwitchLimit/%s/Max/%s', limitServiceHost, limitServiceVersion, limitId, maxLimit);

            if(config.Services.dynamicPort || validator.isIP(limitServiceHost))
            {
                httpUrl = util.format('http://%s:%s/DVP/API/%s/LimitAPI/SwitchLimit/%s/Max/%s', limitServiceHost, limitServicePort, limitServiceVersion, limitId, maxLimit);
            }

            var options = {
                url: httpUrl,
                method: 'PUT',
                headers: {
                    'authorization': securityToken,
                    'companyinfo': compInfo,
                    'content-type': 'application/json'
                }
            };

            logger.debug('[DVP-PhoneNumberTrunkService.updateLimitCompSwitchCallback] - [%s] - Creating Api Url : %s', reqId, httpUrl);


            httpReq(options, function (error, response, body)
            {
                if (!error && response.statusCode == 200)
                {
                    var apiResp = JSON.parse(body);

                    if(apiResp && apiResp.Result)
                    {
                        callback(null, apiResp.Result);
                    }
                    else
                    {
                        callback(apiResp.Exception, null);
                    }

                    logger.debug('[DVP-PhoneNumberTrunkService.updateLimitCompSwitchCallback] - [%s] - Limit Api returned : %s', reqId, body);


                }
                else
                {
                    logger.error('[DVP-PhoneNumberTrunkService.updateLimitCompSwitchCallback] - [%s] - Limit Api call failed', reqId, error);
                    callback(error, null);
                }
            })
        }
        else
        {
            logger.error('[DVP-PhoneNumberTrunkService.updateLimitCompSwitchCallback] - [%s] - Limit api service ip, port or version not set', reqId);
            callback(new Error('Limit api service ip, port or version not set'), null);
        }
    }
    catch(ex)
    {
        logger.error('[DVP-PhoneNumberTrunkService.updateLimitCallback] - [%s] - Exception occurred', reqId, ex);
        callback(ex, null);
    }


};



module.exports.addNewLimit = addNewLimit;
module.exports.addNewLimitCallback = addNewLimitCallback;
module.exports.updateLimitCompSwitchCallback = updateLimitCompSwitchCallback;