const { buildResponse, sendResponse } = require('../src/utils/response.js');

describe('response utility', () => {
    test('buildResponse devuelve una estructura consistente con mensaje y datos', () => {
        expect(buildResponse({ message: 'Ok', data: { id: 1 } })).toEqual({
            message: 'Ok',
            data: { id: 1 },
        });
    });

    test('sendResponse envía estado y payload estandarizado', () => {
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        sendResponse(res, 201, { message: 'Creado', data: { ok: true } });

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Creado',
            data: { ok: true },
        });
    });
});
