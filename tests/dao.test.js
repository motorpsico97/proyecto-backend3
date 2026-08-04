const User = require('../src/models/User.js');
const Product = require('../src/models/Product.js');
const { createUserDao, getUsersDao, createProductDao, getProductsDao } = require('../src/dao');

jest.mock('../src/models/User.js');
jest.mock('../src/models/Product.js');

describe('dao layer', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('createUserDao delega en User.create', async () => {
        const payload = { name: 'Ana', email: 'ana@mail.com', password: '123456', role: 'user' };
        User.create.mockResolvedValue({ _id: '1', ...payload });

        const result = await createUserDao(payload);

        expect(User.create).toHaveBeenCalledWith(payload);
        expect(result).toEqual(expect.objectContaining({ email: 'ana@mail.com' }));
    });

    test('getProductsDao delega en Product.find', async () => {
        const products = [{ title: 'Mouse' }];
        Product.find.mockReturnValue({ sort: jest.fn().mockResolvedValue(products) });

        const result = await getProductsDao();

        expect(Product.find).toHaveBeenCalled();
        expect(result).toEqual(products);
    });

    test('createProductDao delega en Product.create', async () => {
        const payload = { title: 'Teclado', price: 100, stock: 10 };
        Product.create.mockResolvedValue({ _id: '2', ...payload });

        const result = await createProductDao(payload);

        expect(Product.create).toHaveBeenCalledWith(payload);
        expect(result).toEqual(expect.objectContaining({ title: 'Teclado' }));
    });
});
