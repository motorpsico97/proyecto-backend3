const { createProduct, getProducts, getProductById, updateProduct, deleteProduct } = require('../src/controllers/product.controller');
const dao = require('../src/dao');

jest.mock('../src/dao');

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
        dao.createProductDao.mockRejectedValue(error);

        const req = { body: { title: 'X', price: 100, stock: 1 } };
        const res = createRes();
        const next = jest.fn();

        await createProduct(req, res, next);

        expect(next).toHaveBeenCalledWith(error);
    });

    test('getProducts llama next en error inesperado', async () => {
        const error = new Error('boom');
        dao.getProductsDao.mockRejectedValue(error);

        const req = {};
        const res = createRes();
        const next = jest.fn();

        await getProducts(req, res, next);

        expect(next).toHaveBeenCalledWith(error);
    });

    test('getProductById llama next en error inesperado', async () => {
        const error = new Error('boom');
        dao.getProductByIdDao.mockRejectedValue(error);

        const req = { params: { id: 'x' } };
        const res = createRes();
        const next = jest.fn();

        await getProductById(req, res, next);

        expect(next).toHaveBeenCalledWith(error);
    });

    test('updateProduct actualiza title/price/stock cuando vienen definidos', async () => {
        const updatedProduct = {
            title: 'New',
            price: 500,
            stock: 10,
        };

        dao.updateProductDao.mockResolvedValue(updatedProduct);

        const req = { params: { id: '507f191e810c19729de860ea' }, body: { title: 'New', price: 500, stock: 10 } };
        const res = createRes();
        const next = jest.fn();

        await updateProduct(req, res, next);

        expect(dao.updateProductDao).toHaveBeenCalledWith('507f191e810c19729de860ea', {
            title: 'New',
            price: 500,
            stock: 10,
        });
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Producto actualizado.',
            product: updatedProduct,
        });
    });

    test('updateProduct mantiene price y stock cuando no vienen definidos', async () => {
        const updatedProduct = {
            title: 'OnlyTitle',
            price: 100,
            stock: 1,
        };

        dao.updateProductDao.mockResolvedValue(updatedProduct);

        const req = { params: { id: '507f191e810c19729de860ea' }, body: { title: 'OnlyTitle' } };
        const res = createRes();
        const next = jest.fn();

        await updateProduct(req, res, next);

        expect(dao.updateProductDao).toHaveBeenCalledWith('507f191e810c19729de860ea', {
            title: 'OnlyTitle',
        });
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Producto actualizado.',
            product: updatedProduct,
        });
    });

    test('updateProduct llama next en error inesperado', async () => {
        const error = new Error('boom');
        dao.updateProductDao.mockRejectedValue(error);

        const req = { params: { id: 'x' }, body: {} };
        const res = createRes();
        const next = jest.fn();

        await updateProduct(req, res, next);

        expect(next).toHaveBeenCalledWith(error);
    });

    test('deleteProduct llama next en error inesperado', async () => {
        const error = new Error('boom');
        dao.deleteProductDao.mockRejectedValue(error);

        const req = { params: { id: '507f191e810c19729de860ea' } };
        const res = createRes();
        const next = jest.fn();

        await deleteProduct(req, res, next);

        expect(next).toHaveBeenCalledWith(error);
    });
});
