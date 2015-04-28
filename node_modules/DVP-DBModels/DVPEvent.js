module.exports = function(sequelize, DataTypes) {
    var DVPEvent = sequelize.define('CSDB_DVPEvent', {
            EventName: DataTypes.STRING,
            CompanyId: DataTypes.INTEGER,
            TenantId: DataTypes.INTEGER,
            EventClass: DataTypes.STRING,
            EventType: DataTypes.STRING,
            EventCategory: DataTypes.STRING,
            EventTime: DataTypes.DATE,
            EventData: DataTypes.STRING,
            EventParams: DataTypes.STRING(10000)
        }
    );


    return DVPEvent;
};

/*

EVENT CLASS
-----------

 CALL
 APP
 RULE

EVENT TYPES
-------------

CALL -> CHANNEL
APP -> ARDS, HTTAPI_API, DEV_API
RULE -> CALL_RULE

EVENT CATEGORIES
-----------------

DEV_API -> PLAY, GET_DIGITS,
CALL_RULE -> INBOUND, OUTBOUND


 */