const logger = require('../src/utils/logger.js');

describe('logger estructurado', () => {
    let infoSpy;
    let warnSpy;
    let errorSpy;

    beforeEach(() => {
        infoSpy = jest.spyOn(console, 'info').mockImplementation(() => {});
        warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
        errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test('genera mensajes JSON con nivel y metadata', () => {
        logger.info('servidor listo', { port: 8080 });

        expect(infoSpy).toHaveBeenCalledTimes(1);
        const [message] = infoSpy.mock.calls[0];
        expect(message).toContain('"level":"info"');
        expect(message).toContain('"message":"servidor listo"');
        expect(message).toContain('"port":8080');
    });

    test('genera mensajes de error con el nivel adecuado', () => {
        logger.error('fallo de conexión', { service: 'db' });

        expect(errorSpy).toHaveBeenCalledTimes(1);
        const [message] = errorSpy.mock.calls[0];
        expect(message).toContain('"level":"error"');
        expect(message).toContain('"message":"fallo de conexión"');
        expect(message).toContain('"service":"db"');
    });
});
