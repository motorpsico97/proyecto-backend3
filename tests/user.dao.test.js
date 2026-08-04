const User = require('../src/models/User.js');
const {
    createUserDao,
    deleteUserDao,
    findUserByEmailDao,
    findUserByEmailWithPasswordDao,
    getUsersDao,
    getUserByIdDao,
    getUserByIdWithPasswordDao,
    findUserByIdDao,
} = require('../src/dao/user.dao.js');

jest.mock('../src/models/User.js');

describe('user.dao', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('createUserDao delega en User.create con los datos recibidos', async () => {
        const payload = { name: 'Ana', email: 'ana@mail.com', password: '123456' };
        const createdUser = { _id: '1', ...payload };
        User.create.mockResolvedValue(createdUser);

        const result = await createUserDao(payload);

        expect(User.create).toHaveBeenCalledWith(payload);
        expect(result).toEqual(createdUser);
    });

    test('findUserByEmailDao consulta por email', async () => {
        const user = { _id: '1', email: 'ana@mail.com' };
        User.findOne.mockReturnValue(user);

        const result = await findUserByEmailDao('ana@mail.com');

        expect(User.findOne).toHaveBeenCalledWith({ email: 'ana@mail.com' });
        expect(result).toEqual(user);
    });

    test('findUserByEmailWithPasswordDao consulta por email y selecciona password', async () => {
        const user = { _id: '1', email: 'ana@mail.com', password: '123456' };
        const selectMock = jest.fn().mockResolvedValue(user);
        User.findOne.mockReturnValue({ select: selectMock });

        const result = await findUserByEmailWithPasswordDao('ana@mail.com');

        expect(User.findOne).toHaveBeenCalledWith({ email: 'ana@mail.com' });
        expect(selectMock).toHaveBeenCalledWith('+password');
        expect(result).toEqual(user);
    });

    test('getUsersDao obtiene usuarios sin password', async () => {
        const users = [{ _id: '1', name: 'Ana' }];
        const selectMock = jest.fn().mockResolvedValue(users);
        User.find.mockReturnValue({ select: selectMock });

        const result = await getUsersDao();

        expect(User.find).toHaveBeenCalled();
        expect(selectMock).toHaveBeenCalledWith('-password');
        expect(result).toEqual(users);
    });

    test('getUserByIdDao obtiene usuario por id sin password', async () => {
        const user = { _id: '1', name: 'Ana' };
        const selectMock = jest.fn().mockResolvedValue(user);
        User.findById.mockReturnValue({ select: selectMock });

        const result = await getUserByIdDao('1');

        expect(User.findById).toHaveBeenCalledWith('1');
        expect(selectMock).toHaveBeenCalledWith('-password');
        expect(result).toEqual(user);
    });

    test('getUserByIdWithPasswordDao obtiene usuario por id incluyendo password', async () => {
        const user = { _id: '1', name: 'Ana', password: '123456' };
        const selectMock = jest.fn().mockResolvedValue(user);
        User.findById.mockReturnValue({ select: selectMock });

        const result = await getUserByIdWithPasswordDao('1');

        expect(User.findById).toHaveBeenCalledWith('1');
        expect(selectMock).toHaveBeenCalledWith('+password');
        expect(result).toEqual(user);
    });

    test('findUserByIdDao consulta por id sin filtros adicionales', async () => {
        const user = { _id: '1', name: 'Ana' };
        User.findById.mockResolvedValue(user);

        const result = await findUserByIdDao('1');

        expect(User.findById).toHaveBeenCalledWith('1');
        expect(result).toEqual(user);
    });

    test('deleteUserDao elimina el usuario cuando existe', async () => {
        const user = {
            _id: '1',
            deleteOne: jest.fn().mockResolvedValue(undefined),
        };
        User.findById.mockResolvedValue(user);

        const result = await deleteUserDao('1');

        expect(User.findById).toHaveBeenCalledWith('1');
        expect(user.deleteOne).toHaveBeenCalled();
        expect(result).toEqual(user);
    });

    test('deleteUserDao devuelve null cuando el usuario no existe', async () => {
        User.findById.mockResolvedValue(null);

        const result = await deleteUserDao('1');

        expect(result).toBeNull();
    });
});
