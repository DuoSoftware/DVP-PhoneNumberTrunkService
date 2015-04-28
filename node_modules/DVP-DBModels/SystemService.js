module.exports = function(sequelize, DataTypes) {
    var SystemService = sequelize.define('CSDB_SystemService', {
            AppName: DataTypes.STRING,
            Description: DataTypes.STRING,
            AppVersion: DataTypes.STRING,
            AppVersionStatus: DataTypes.STRING,
            SourceUrl: DataTypes.STRING,
            DockerUrl: DataTypes.STRING,
            ObjClass: DataTypes.STRING,
            ObjType: DataTypes.STRING,
            ObjCategory: DataTypes.STRING,
            CompanyId: DataTypes.INTEGER,
            TenantId: DataTypes.INTEGER,
            NoOfPorts: DataTypes.INTEGER,
            PortType: DataTypes.STRING,
            ServiceProtocol: DataTypes.STRING,
            Importance: DataTypes.STRING //LB, FAIL_OVER, NONE

        }
    );


    return SystemService;
};