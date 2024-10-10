const path = require('path');
const { get } = require('stack-trace');
const fs = require('fs');
const { getLogger, initialize } = require('./winston/winston-logger');
const { LOG_LEVELS } = require('./log-levels');

const CALL_STACK_DEPTH = 3;
const MAX_INNER_ERRORS_DEPTH = 2;

class Logger {
    constructor({ moduleName } = {}) {
        this.moduleName = moduleName || this._getCallerModuleName();

        this.log = this.log.bind(this);
    }

    static initialize({ consoleConfig }) {
        const logsDir = consoleConfig.logsDir || 'logs';

        if (!fs.existsSync(logsDir)) {
            fs.mkdirSync(logsDir);
        }

        const logFileName = consoleConfig.logFileName || 'e2e-tests.log';

        // eslint-disable-next-line no-param-reassign
        consoleConfig.logFileFullPath = path.join(logsDir, `${logFileName}`);
        initialize({ consoleConfig });
        Logger.markInitialized();
    }

    static markInitialized() {
        Logger.initialzed = true;
    }

    static isInitialized() {
        return Logger.initialzed;
    }

    _getCallerModuleName() {
        const stack = get();
        const callerModule = stack[CALL_STACK_DEPTH].getFileName();

        return path.basename(callerModule);
    }

    _buildPrettyStackTrace(stack) {
        return stack
            .map((item) => {
                if (item.isNative()) {
                    return null;
                }

                if (!item.getFunctionName()) {
                    return null;
                }

                // eslint-disable-next-line
                return `${item.getFunctionName()} (${item.getFileName()}:${item.getLineNumber()}:${item.getColumnNumber()})`;
            })
            .filter((item) => !!item);
    }

    _spreadError(error, level) {
        const meta = { errorMessage: error.message, stack: error.stack, ...error };

        if (!error.innerError) {
            return meta;
        }

        if (level < MAX_INNER_ERRORS_DEPTH) {
            meta.innerError = this._spreadMeta(error.innerError, level + 1);
        }

        return meta;
    }

    _spreadMeta(meta, level = 1) {
        const spreadMeta = meta instanceof Error ? this._spreadError(meta, level) : meta;

        if (spreadMeta && level < MAX_INNER_ERRORS_DEPTH) {
            Object.keys(spreadMeta).forEach((field) => {
                if (spreadMeta[field] instanceof Error) {
                    spreadMeta[field] = this._spreadError(spreadMeta[field], level);
                }
            });
        }

        return spreadMeta;
    }

    /**
     * Logs debug message
     * @param msg
     * @param meta an Error object or a general { key: value } object with additional info to be logged
     */
    debug(msg, meta) {
        this.log(LOG_LEVELS.DEBUG, msg, meta, true);
    }

    /**
     * Logs info message
     * @param msg
     * @param meta an Error object or a general { key: value } object with additional info to be logged
     */
    info(msg, meta) {
        this.log(LOG_LEVELS.INFO, msg, meta);
    }

    /**
     * Logs warn message
     * @param msg
     * @param meta an Error object or a general { key: value } object with additional info to be logged
     */
    warn(msg, meta) {
        this.log(LOG_LEVELS.WARN, msg, meta);
    }

    /**
     * Logs error message
     * @param msg
     * @param meta an Error object or a general { key: value } object with additional info to be logged
     */
    error(msg, meta) {
        this.log(LOG_LEVELS.ERROR, msg, meta, true);
    }

    /**
     * Logs a message
     * @param level log level (one of: LOG_LEVELS)
     * @param msg
     * @param meta an Error object or a general { key: value } object with additional info to be logged
     * @param appendStack
     */
    log(level, msg, meta = {}, appendStack = false) {
        if (!Logger.isInitialized()) {
            throw new Error(
                "The logger was not initialized, you can not log. please run 'initialize(config)",
            );
        }

        const payload = { ...this._spreadMeta(meta), className: this.moduleName, logLevel: level };

        if (appendStack) {
            payload.stack = this._buildPrettyStackTrace(get());
        }

        getLogger().log(level, msg, payload);
    }
}

Logger.initialzed = false;

// const filename = path.join(logDir, 'e2e-tests.log');

// const logger = createLogger({
//     level: 'debug',
//     format: format.combine(
//         // format.label({ label: path.basename(process.mainModule.filename) }),
//         // format.colorize(),
//         format.json(),
//         format.timestamp({
//             format: 'YYYY-MM-DD HH:mm:ss:sss',
//         }),
//         // format.printf(info => `${info.timestamp} ${info.level} [${info.label}]: ${info.message}`)
//         format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`),
//     ),
//     defaultMeta: { service: 'e2e-tests' },
//     transports: [
//         new transports.Console({
//             level: 'debug',
//             format: format.combine(
//                 format.colorize(),
//                 format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`),
//             ),
//         }),
//         new transports.File({ filename }),
//     ],
// });

module.exports = {
    Logger,
};
