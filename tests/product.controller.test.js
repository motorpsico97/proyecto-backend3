const Product = require('../src/models/Product');
const { createProduct, getProducts, getProductById, updateProduct, deleteProduct } = require('../src/controllers/product.controller');

jest.mock('../src/models/Product');

const createRes = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

describe('product.controller unit', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('createProduct llama next en error inesperado', async () => {
        const error = new Error('boom');
        Product.create.mockRejectedValue(error);

        const req = { body: { title: 'X', price: 100, stock: 1 } };
        const res = createRes();
        const next = jest.fn();

        await createProduct(req, res, next);

        expect(next).toHaveBeenCalledWith(error);
    });

    test('getProducts llama next en error inesperado', async () => {
        const error = new Error('boom');
        Product.find.mockRejectedValue(error);

        const req = {};
        const res = createRes();
        const next = jest.fn();

        await getProducts(req, res, next);

        expect(next).toHaveBeenCalledWith(error);
    });

    test('getProductById llama next en error inesperado', async () => {
        const error = new Error('boom');
        Product.findById.mockRejectedValue(error);

        const req = { params: { id: 'x' } };
        const res = createRes();
        const next = jest.fn();

        await getProductById(req, res, next);

        expect(next).toHaveBeenCalledWith(error);
    });

    test('updateProduct actualiza title/price/stock cuando vienen definidos', async () => {
        const productDoc = {
            title: 'Old',
            price: 100,
            stock: 1,
            save: jest.fn().mockResolvedValue(undefined),
        };

        Product.findById.mockResolvedValue(productDoc);

        const req = { params: { id: '507f191e810c19729de860ea' }, body: { title: 'New', price: 500, stock: 10 } };
        const res = createRes();
        const next = jest.fn();

        await updateProduct(req, res, next);

        expect(productDoc.title).toBe('New');
        expect(productDoc.price).toBe(500);
        expect(productDoc.stock).toBe(10);
        expect(res.status).toHaveBeenCalledWith(200);
    });

    test('updateProduct mantiene price y stock cuando no vienen definidos', async () => {
        const productDoc = {
            title: 'Old',
            price: 100,
            stock: 1,
            save: jest.fn().mockResolvedValue(undefined),
        };

        Product.findById.mockResolvedValue(productDoc);

        const req = { params: { id: '507f191e810c19729de860ea' }, body: { title: 'OnlyTitle' } };
        const res = createRes();
        const next = jest.fn();

        await updateProduct(req, res, next);

        expect(productDoc.title).toBe('OnlyTitle');
        expect(productDoc.price).toBe(100);
        expect(productDoc.stock).toBe(1);
        expect(res.status).toHaveBeenCalledWith(200);
    });

    test('updateProduct llama next en error inesperado', async () => {
        const error = new Error('boom');
        Product.findById.mockRejectedValue(error);

        const req = { params: { id: 'x' }, body: {} };
        const res = createRes();
        const next = jest.fn();

        await updateProduct(req, res, next);

        expect(next).toHaveBeenCalledWith(error);
    });

    test('deleteProduct llama next en error inesperado', async () => {
        const error = new Error('boom');
        Product.findById.mockRejectedValue(error);

        const req = { params: { id: '507f191e810c19729de860ea' } };
        const res = createRes();
        const next = jest.fn();

        await deleteProduct(req, res, next);

        expect(next).toHaveBeenCalledWith(error);
    });
});
