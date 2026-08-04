const getTimestamp = () => new Date().toISOString();

const buildLogEntry = (level, message, meta = {}) => ({
    timestamp: getTimestamp(),
    level,
    message,
    environment: process.env.NODE_ENV || 'development',
    ...meta,
});

const writeLog = (level, message, meta = {}) => {
    const entry = buildLogEntry(level, message, meta);
    const serialized = JSON.stringify(entry);

    if (level === 'error') {
        console.error(serialized);
        return;
    }

    if (level === 'warn') {
        console.warn(serialized);
        return;
    }

    console.info(serialized);
};

const logger = {
    info: (message, meta) => writeLog('info', message, meta),
    warn: (message, meta) => writeLog('warn', message, meta),
    error: (message, meta) => writeLog('error', message, meta),
    http: (message, meta) => writeLog('info', message, { ...meta, category: 'http' }),
};

module.exports = logger;
