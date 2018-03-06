/**
 * Created by dinusha on 11/10/2016.
 */
var redisClient = require('./RedisHandler.js').redisClient;
var Promise = require('bluebird');
var Redlock = require('redlock');
var dbModel = require('dvp-dbmodels');
var logger = require('dvp-common/LogHandler/CommonLogHandler.js').logger;
var externalApiAccess = require('./ExternalApiAccess.js');

var redlock = new Redlock(
    [redisClient],
    {
        driftFactor: 0.01,

        retryCount:  10000,

        retryDelay:  200

    }
);

redlock.on('clientError', function(err)
{
    logger.error('[DVP-PhoneNumberTrunkService.AcquireLock] - [%s] - REDIS LOCK FAILED', err);

});

var getTrunkListForOperator = function(operatorCode, companyId, tenantId)
{
    return new Promise(function(resolve, reject)
    {
        try
        {
            dbModel.TrunkOperator.find({where :[{OperatorCode: operatorCode, CompanyId: companyId, TenantId: tenantId}], include:[{model: dbModel.Trunk, as: "Trunk", where :[{CompanyId: companyId, TenantId: tenantId}]}]})
                .then(function(operatorObj)
                {
                    resolve(operatorObj);

                }).catch(function(err)
                {
                    reject(err);
                })
        }
        catch(ex)
        {
            reject(ex);
        }
    })

};

var getTrunkForNumber = function(phoneNumber, companyId, tenantId)
{
    return new Promise(function(resolve, reject)
    {
        try
        {
            dbModel.TrunkPhoneNumber.find({where :[{PhoneNumber: phoneNumber, CompanyId: companyId, TenantId: tenantId}], include:[{model: dbModel.Trunk, as: "Trunk", include: [{model: dbModel.TrunkPhoneNumber, as: "TrunkPhoneNumber", include: [{model: dbModel.LimitInfo, as: "LimitInfoInbound"}, {model: dbModel.LimitInfo, as: "LimitInfoOutbound"}, {model: dbModel.LimitInfo, as: "LimitInfoBoth"}]}]}]})
                .then(function(trunkNumObj)
                {
                    resolve(trunkNumObj);

                }).catch(function(err)
                {
                    reject(err);
                })
        }
        catch(ex)
        {
            reject(ex);
        }
    })

};

var addPhoneNumberToTrunk = function(reqId, trunkId, companyId, tenantId, phoneNumberObj)
{
    return new Promise(function(resolve, reject)
    {
        try
        {
            dbModel.TrunkPhoneNumber.find({where :[{PhoneNumber: phoneNumberObj.PhoneNumber}]})
                .then(function(phnNum)
                {
                    if(phnNum)
                    {
                        reject(new Error('Phone Number Already Exists'));
                    }
                    else
                    {
                        //call limit api to add a new limit
                        var phoneNum = dbModel.TrunkPhoneNumber.build({
                            PhoneNumber: phoneNumberObj.PhoneNumber,
                            ObjClass: 'FACETONE',
                            ObjType: 'CALL',
                            ObjCategory: 'BOTH',
                            Enable: true,
                            CompanyId: phoneNumberObj.ClientCompany,
                            TenantId: phoneNumberObj.ClientTenant,
                            TrunkId: trunkId
                        });

                        phoneNum
                            .save()
                            .then(function (rslt)
                            {
                                resolve(true);

                            }).catch(function(err)
                            {
                                reject(err);
                            })
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
    })

};

var updateTrunkLimit = function(reqId, incrLimit, companyId, tenantId, trunkObj)
{
    return new Promise(function(resolve, reject)
    {
        try
        {
            var lim = parseInt(incrLimit);
            if(trunkObj.MaxLimit && trunkObj.MaxLimit > 0)
            {
                lim = lim + trunkObj.MaxLimit;
            }

            trunkObj.updateAttributes({MaxLimit: lim})
                .then(function(updateResult)
                {
                    if(updateResult)
                    {
                        resolve(true);
                    }
                    else
                    {
                        reject(new Error('Update trunk limit error'));
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
    })

};

var addLimitAndSetToNumber = function(reqId, maxLimit, companyId, tenantId, phoneNumberObj)
{
    return new Promise(function(resolve, reject)
    {
        try
        {
            if(phoneNumberObj.BothLimitId)
            {
                //update
                dbModel.LimitInfo.find({where :[{LimitId: phoneNumberObj.BothLimitId}]})
                    .then(function(limit)
                    {
                        var tempCount = maxLimit;
                        if(limit.MaxCount)
                        {
                            tempCount = tempCount + limit.MaxCount;
                        }
                        limit.updateAttributes({MaxCount: tempCount})
                            .then(function(updateResult)
                            {
                                if(updateResult)
                                {
                                    resolve(true);
                                }
                                else
                                {
                                    reject(new Error('Update limit error'));
                                }

                            }).catch(function(err)
                            {
                                reject(err);
                            })

                    })
                    .catch(function(err)
                    {
                        reject(err);

                    })
            }
            else
            {
                externalApiAccess.addNewLimit(reqId, phoneNumberObj.PhoneNumber, phoneNumberObj.PhoneNumber + ' Both Limit', maxLimit, companyId, tenantId)
                    .then(function(limitInfo)
                    {
                        if(limitInfo)
                        {
                            phoneNumberObj.updateAttributes({BothLimitId: limitInfo.LimitId})
                                .then(function(updateResult)
                                {
                                    if(updateResult)
                                    {
                                        resolve(true);
                                    }
                                    else
                                    {
                                        reject(new Error('Update limit error'));
                                    }

                                }).catch(function(err)
                                {
                                    reject(err);
                                })
                        }
                        else
                        {
                            reject(new Error('Add limit failed'));
                        }
                    })
                    .catch(function(err)
                    {
                        reject(err);
                    })
            }


        }
        catch(ex)
        {
            reject(ex);
        }
    })

};

var verifyPhoneNumberLimit = function(trunkLimit, numberLimit, phoneNumbers)
{
    try
    {
        if(trunkLimit > 0)
        {
            if(phoneNumbers && phoneNumbers.length > 0)
            {
                var currentCount = 0;
                phoneNumbers.forEach(function(number)
                {
                    if(number.LimitInfoBoth && number.LimitInfoBoth.MaxCount && number.LimitInfoBoth.MaxCount > 0)
                    {
                        currentCount = currentCount + number.LimitInfoBoth.MaxCount;
                    }
                    else
                    {
                        if(number.LimitInfoInbound && number.LimitInfoInbound.MaxCount && number.LimitInfoInbound.MaxCount > 0)
                        {
                            currentCount = currentCount + number.LimitInfoInbound.MaxCount;
                        }

                        if(number.LimitInfoOutbound && number.LimitInfoOutbound.MaxCount && number.LimitInfoOutbound.MaxCount > 0)
                        {
                            currentCount = currentCount + number.LimitInfoOutbound.MaxCount;
                        }
                    }

                });

                if((currentCount + numberLimit) > trunkLimit)
                {
                    return false;
                }
                else
                {
                    return true;
                }
            }
            else
            {
                return true;
            }
        }
        else
        {
            return false;
        }
    }
    catch(ex)
    {
        return false;
    }


};

var buyNumberOperation = function(reqId, operatorCode, phoneNumberObj, companyId, tenantId)
{
    return new Promise(function(resolve, reject)
    {
        var trunk = null;
        getTrunkListForOperator(operatorCode, companyId, tenantId)
            .then(function(operator)
            {
                if(operator && operator.Trunk)
                {
                    trunk = operator.Trunk[0];

                    return addPhoneNumberToTrunk(reqId, trunk.id, companyId, tenantId, phoneNumberObj);
                }
                else
                {
                    reject(new Error('Count cannot be validated'));
                }

            })
            .then(function(result)
            {
                resolve(trunk);

            })
            .catch(function(err)
            {
                reject(err);
            })
    });

};

var trunkLimitIncrementByOperator = function(reqId, operatorCode, trunkLimitIncrement, companyId, tenantId)
{
    return new Promise(function(resolve, reject)
    {
        var ttl = 10000;
        var lockKey = 'OPERATORLOCK:' + operatorCode;

        redlock.lock(lockKey, ttl)
            .then(function(lock)
            {
                var trunk = null;
                getTrunkListForOperator(operatorCode, companyId, tenantId)
                    .then(function(operator)
                    {
                        if(operator && operator.Trunk)
                        {
                            trunk = operator.Trunk[0];

                            return updateTrunkLimit(reqId, trunkLimitIncrement, companyId, tenantId, trunk);
                        }
                        else
                        {
                            lock.unlock()
                                .catch(function(err) {
                                    logger.error('[DVP-PhoneNumberTrunkService.addPhoneNumberWithLimitToOperatorTrunk] - [%s] - REDIS LOCK RELEASE FAILED', err);
                                });
                            reject(new Error('Trunk not found for operator'));
                        }

                    })
                    .then(function(result)
                    {
                        lock.unlock()
                            .catch(function(err) {
                                logger.error('[DVP-PhoneNumberTrunkService.addPhoneNumberWithLimitToOperatorTrunk] - [%s] - REDIS LOCK RELEASE FAILED', err);
                            });
                        resolve(result);

                    })
                    .catch(function(err)
                    {
                        lock.unlock()
                            .catch(function(err) {
                                logger.error('[DVP-PhoneNumberTrunkService.addPhoneNumberWithLimitToOperatorTrunk] - [%s] - REDIS LOCK RELEASE FAILED', err);
                            });
                        reject(err);
                    })

            })
            .catch(function(err)
            {
                reject(err);

            });

    });

};

var assignNumberLimit = function(reqId, operatorCode, phoneNumberObj, companyId, tenantId)
{
    return new Promise(function(resolve, reject)
    {
        var ttl = 10000;
        var lockKey = 'OPERATORLOCK:' + operatorCode;

        redlock.lock(lockKey, ttl)
            .then(function(lock)
            {
                var trunk = null;
                getTrunkForNumber(phoneNumberObj.PhoneNumber, companyId, tenantId)
                    .then(function(numberDetails)
                    {
                        if(numberDetails && numberDetails.Trunk)
                        {
                            trunk = numberDetails.Trunk;

                            if(verifyPhoneNumberLimit(trunk.MaxLimit, phoneNumberObj.Limit, trunk.TrunkPhoneNumber))
                            {
                                // return the new promise
                                return addLimitAndSetToNumber(reqId, phoneNumberObj.Limit, companyId, tenantId, numberDetails);
                            }
                            else
                            {
                                lock.unlock()
                                    .catch(function(err) {
                                        logger.error('[DVP-PhoneNumberTrunkService.addPhoneNumberWithLimitToOperatorTrunk] - [%s] - REDIS LOCK RELEASE FAILED', err);
                                    });
                                reject(new Error('Count cannot be validated'));
                            }
                        }
                        else
                        {
                            lock.unlock()
                                .catch(function(err) {
                                    logger.error('[DVP-PhoneNumberTrunkService.addPhoneNumberWithLimitToOperatorTrunk] - [%s] - REDIS LOCK RELEASE FAILED', err);
                                });
                            reject(new Error('Count cannot be validated'));
                        }

                    })
                    .then(function(result)
                    {
                        lock.unlock()
                            .catch(function(err) {
                                logger.error('[DVP-PhoneNumberTrunkService.addPhoneNumberWithLimitToOperatorTrunk] - [%s] - REDIS LOCK RELEASE FAILED', err);
                            });

                        resolve(result);

                    })
                    .catch(function(err)
                    {
                        lock.unlock()
                            .catch(function(err) {
                                logger.error('[DVP-PhoneNumberTrunkService.addPhoneNumberWithLimitToOperatorTrunk] - [%s] - REDIS LOCK RELEASE FAILED', err);
                            });
                        reject(err);
                    })

            })
            .catch(function(err)
            {
                reject(err);

            });

    });

};

module.exports.buyNumberOperation = buyNumberOperation;
module.exports.assignNumberLimit = assignNumberLimit;
module.exports.trunkLimitIncrementByOperator = trunkLimitIncrementByOperator;