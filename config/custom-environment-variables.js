/**
 * Created by dinusha on 4/22/2015.
 */

module.exports = {

    "DB": {
        "Type":"SYS_DATABASE_TYPE",
        "User":"SYS_DATABASE_POSTGRES_USER",
        "Password":"SYS_DATABASE_POSTGRES_PASSWORD",
        "Port":"SYS_SQL_PORT",
        "Host":"SYS_DATABASE_HOST",
        "Database":"SYS_DATABASE_POSTGRES_USER"
    },

    "Host":{
        "Port":"HOST_PHONENUMBERTRUNKSERVICE_PORT",
        "Version":"HOST_VERSION"
    },

    "Redis":
    {
        "ip": "SYS_REDIS_HOST",
        "port": "SYS_REDIS_PORT",
        "password": "SYS_REDIS_PASSWORD",
        "db": "SYS_REDIS_DB_CONFIG"

    },
    "Security":
    {
        "ip": "SYS_REDIS_HOST",
        "port": "SYS_REDIS_PORT",
        "user": "SYS_REDIS_USER",
        "password": "SYS_REDIS_PASSWORD"

    },
    "Services": {
        "limitServiceHost": "SYS_LIMITHANDLER_HOST",
        "limitServicePort": "SYS_LIMITHANDLER_PORT",
        "limitServiceVersion": "SYS_LIMITHANDLER_VERSION"
    },
    "Token": "HOST_TOKEN"
};
