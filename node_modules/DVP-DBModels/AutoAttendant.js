/**
 * Created by a on 6/4/2015.
 */


module.exports = function(sequelize, DataTypes) {
    var AutoAttendant = sequelize.define('CSDB_AutoAttendant', {
            Name: {type: DataTypes.STRING,unique: true},
            Code: DataTypes.STRING,
            Extention: {type: DataTypes.STRING,unique: "compositeIndex"},
            DayGreeting: DataTypes.STRING,
            NightGreeting: DataTypes.STRING,
            RetryGreeting: DataTypes.STRING,
            InvalidDigitSound: DataTypes.STRING,
            ExitSound: DataTypes.STRING,
            Menu: DataTypes.STRING,
            LoopCountOnFailure: DataTypes.INTEGER,
            LoopCountOnTimeout: DataTypes.INTEGER,
            TimeOut: DataTypes.INTEGER,
            EnableExtention: DataTypes.BOOLEAN,
            ExtentionLength: DataTypes.INTEGER,
            Company: {type: DataTypes.INTEGER,unique: "compositeIndex"},
            Tenant: {type: DataTypes.INTEGER,unique: "compositeIndex"}
        }
    );


    return AutoAttendant;
};
