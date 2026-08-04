const Product = require('../src/models/Product');
const {
    createProductDao,
    getProductsDao,
    getProductByIdDao,
    updateProductDao,
    deleteProductDao,
} = require('../src/dao/product.dao');

jest.mock('../src/models/Product');

describe('product.dao', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('createProductDao delega en Product.create con los datos recibidos', async () => {
        const payload = { title: 'Teclado', price: 100, stock: 5 };
        const createdProduct = { _id: '1', ...payload };
        Product.create.mockResolvedValue(createdProduct);

        const result = await createProductDao(payload);

        expect(Product.create).toHaveBeenCalledWith(payload);
        expect(result).toEqual(createdProduct);
    });

    test('getProductsDao aplica orden descendente por createdAt cuando existe sort', async () => {
        const products = [{ title: 'Teclado' }];
        const sortMock = jest.fn().mockResolvedValue(products);
        Product.find.mockReturnValue({ sort: sortMock });

        const result = await getProductsDao();

        expect(Product.find).toHaveBeenCalled();
        expect(sortMock).toHaveBeenCalledWith({ createdAt: -1 });
        expect(result).toEqual(products);
    });

    test('getProductsDao devuelve la query cuando no soporta sort', async () => {
        const query = { title: 'fallback' };
        Product.find.mockReturnValue(query);

        const result = await getProductsDao();

        expect(result).toEqual(query);
    });

    test('getProductByIdDao consulta por id', async () => {
        const product = { _id: '1', title: 'Mouse' };
        Product.findById.mockResolvedValue(product);

        const result = await getProductByIdDao('1');

        expect(Product.findById).toHaveBeenCalledWith('1');
        expect(result).toEqual(product);
    });

    test('updateProductDao actualiza y guarda el producto cuando existe', async () => {
        const product = {
            _id: '1',
            title: 'Viejo',
            price: 100,
            stock: 1,
            save: jest.fn().mockResolvedValue(undefined),
        };
        Product.findById.mockResolvedValue(product);

        const result = await updateProductDao('1', { title: 'Nuevo', price: 200 });

        expect(Product.findById).toHaveBeenCalledWith('1');
        expect(product.title).toBe('Nuevo');
        expect(product.price).toBe(200);
        expect(product.save).toHaveBeenCalled();
        expect(result).toEqual(product);
    });

    test('updateProductDao devuelve null cuando el producto no existe', async () => {
        Product.findById.mockResolvedValue(null);

        const result = await updateProductDao('1', { title: 'Nuevo' });

        expect(result).toBeNull();
    });

    test('deleteProductDao elimina el producto cuando existe', async () => {
        const product = {
            _id: '1',
            deleteOne: jest.fn().mockResolvedValue(undefined),
        };
        Product.findById.mockResolvedValue(product);

        const result = await deleteProductDao('1');

        expect(Product.findById).toHaveBeenCalledWith('1');
        expect(product.deleteOne).toHaveBeenCalled();
        expect(result).toEqual(product);
    });

    test('deleteProductDao devuelve null cuando el producto no existe', async () => {
        Product.findById.mockResolvedValue(null);

        const result = await deleteProductDao('1');

        expect(result).toBeNull();
    });
});
