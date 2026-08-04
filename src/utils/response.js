const buildResponse = ({ message, data, meta = null }) => ({
    message,
    ...(data !== undefined ? { data } : {}),
    ...(meta ? { meta } : {}),
});

const sendResponse = (res, statusCode, payload) => {
    const response = buildResponse(payload);
    return res.status(statusCode).json(response);
};

module.exports = {
    buildResponse,
    sendResponse,
};
