const buildResponse = ({ message, data, meta = null, ...rest }) => ({
    message,
    ...(data !== undefined ? { data } : {}),
    ...(meta ? { meta } : {}),
    ...rest,
});

const sendResponse = (res, statusCode, payload) => {
    const response = buildResponse(payload);
    return res.status(statusCode).json(response);
};

module.exports = {
    buildResponse,
    sendResponse,
};
