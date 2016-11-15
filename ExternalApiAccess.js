/**
 * Created by dinusha on 11/10/2016.
 */

var Promise = require('bluebird');
var config = require('config');
var util = require('util');
var logger = require('dvp-common/LogHandler/CommonLogHandler.js').logger;
var httpReq = require('request');
var validator = require('validator');

var addNewLimit = function(reqId, phoneNumber, maxLimit, companyId, tenantId)
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

                if(validator.isIP(limitServiceHost))
                {
                    httpUrl = util.format('http://%s:%s/DVP/API/%s/LimitAPI/Limit', limitServiceHost, limitServicePort, limitServiceVersion);
                }

                var obj = {
                    MaxCount: maxLimit,
                    LimitDescription: phoneNumber + ' Inbound Limit',
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

module.exports.addNewLimit = addNewLimit;