module.exports = {
  "DB": {
    "Type":"postgres",
    "User":"duo",
    "Password":"DuoS123",
    "Port":5432,
    "Host":"localhost",
    "Database":"dvpdb"
  },

  "Security":
  {
    "ip" : "45.55.142.207",
    "port": 6379
  },

  "Redis":
  {
    "ip": "45.55.142.207",
    "port": 6379

  },
  "Host":{
    "Ip":"0.0.0.0",
    "Port":"9898",
    "Version":"1.0.0.0"
  },
  "Services": {
    "limitServiceRootPath": "http://limithandler.104.131.67.21.xip.io/DVP/API/1.0.0.0"
  }
};