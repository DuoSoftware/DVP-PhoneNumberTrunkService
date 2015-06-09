module.exports = function(sequelize, DataTypes)
{
    var PBXUser = sequelize.define('CSDB_PBXUser',
        {
            UserUuid: {type:DataTypes.STRING, primaryKey:true},
            BypassMedia: DataTypes.BOOLEAN,
            IgnoreEarlyMedia: DataTypes.BOOLEAN,
            VoicemailEnabled: DataTypes.BOOLEAN,
            AllowOutbound: DataTypes.BOOLEAN,
            AllowedNumbers: DataTypes.STRING,
            RingTimeout: DataTypes.INTEGER,
            ScheduleId: DataTypes.INTEGER,
            CompanyId: DataTypes.INTEGER,
            TenantId: DataTypes.INTEGER,
            ObjClass: DataTypes.STRING,
            ObjType: DataTypes.STRING,
            ObjCategory: DataTypes.STRING            
        }
    );

    return PBXUser;
};