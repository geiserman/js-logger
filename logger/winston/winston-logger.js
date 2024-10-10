const { createLogger } = require('./winston-logger-initializer');

let loggerInstance;

/**
 * Retrieves a single instance of the logger.
 * Logger must be initialized with "initializeLogger" before using it, otherwise it will throw an error.
 * @returns {*} logger
 */
function getLogger() {
    if (!loggerInstance) {
        throw new Error(
            "The logger was not initialized. please run 'initialize(config)' " +
                'on your service initialization phase first before you try to consume it.',
        );
    }

    return loggerInstance;
}

/**
 * Initializes the logger with the given options param.
 * @param options
 */
function initialize({ consoleConfig }) {
    loggerInstance = createLogger({ consoleConfig });
}

module.exports = {
    initialize,
    getLogger,
};
