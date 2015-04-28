var winston = require('winston');

winston.add(winston.transports.File, { filename: 'D:/somefile.log' });

var WriteLog = function(message)
{
    winston.log('info', 'Hello distributed log files!');
    winston.info('Hello again distributed logs');
};

module.exports.WriteLog = WriteLog;