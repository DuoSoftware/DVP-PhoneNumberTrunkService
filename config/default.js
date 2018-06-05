module.exports = {
  "DB": {
    "Type":"postgres",
    "User":"",
    "Password":"",
    "Port":5432,
    "Host":"",
    "Database":""
  },

  "Redis":
  {
    "mode":"sentinel",//instance, cluster, sentinel
    "ip": "",
    "port": 6389,
    "user": "",
    "password": "",
    "redisDB":0,
    "sentinels":{
      "hosts": "",
      "port":16389,
      "name":"redis-cluster"
    }

  },


  "Security":
  {

    "ip" : "",
    "port": 6389,
    "user": "",
    "password": "",
    "mode":"sentinel",//instance, cluster, sentinel
    "sentinels":{
      "hosts": "",
      "port":16389,
      "name":"redis-cluster"
    }
  },
  "Host":{
    "Ip":"0.0.0.0",
    "Port":"9898",
    "Version":"1.0.0.0"
  },

  "Services": {
    "limitServiceRootPath": "",
    "limitServiceHost": "",
    "limitServicePort": 8085,
    "limitServiceVersion": "1.0.0.0"
  },

  "Token": ""
};
