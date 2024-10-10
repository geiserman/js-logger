const winston = require('winston');

const { transports } = require('winston');

/**
 * Initialize winston logger with the given config parameter
 * @param consoleConfig
 * @returns {Logger}
 */
function createLogger({ consoleConfig = {} }) {
    const filename = consoleConfig.logFileFullPath;
    const format =
        consoleConfig.onlyJson === true
            ? winston.format.json()
            : winston.format.combine(
                  winston.format.timestamp({
                      format: 'YYYY-MM-DD HH:mm:ss:sss',
                  }),
                  winston.format.colorize(),
                  winston.format.printf(
                      (info) => `${info.timestamp} ${info.level}: ${info.message}`,
                  ),
              );
    const formatLog =
        consoleConfig.onlyJson === true
            ? winston.format.json()
            : winston.format.combine(
                  winston.format.timestamp({
                      format: 'YYYY-MM-DD HH:mm:ss:sss',
                  }),
                  winston.format.printf(
                      (info) => `${info.timestamp} ${info.level}: ${info.message}`,
                  ),
              );

    return winston.createLogger({
        level: consoleConfig.logLevel,
        format: formatLog,
        transports: [
            new transports.Console({
                silent: !consoleConfig.isEnabled,
                level: consoleConfig.logLevel || 'info',
                format,
                handleExceptions: true,
            }),
            // new transports.File({ filename: 'info.log', level: 'info', maxsize: 100, maxFiles: 30 }),
            new transports.File({ filename, maxsize: 10485760, maxFiles: 1 }),
        ],
        exitOnError: false,
    });
}

module.exports = { createLogger };
