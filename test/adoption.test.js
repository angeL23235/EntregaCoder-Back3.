import { expect } from 'chai';
import request from 'supertest';
import express from 'express';
import sinon from 'sinon';
import { adoptionsService, petsService, usersService } from '../src/services/index.js';
import adoptionsRouter from '../src/routes/adoption.router.js';

describe('Adoption Router Tests', () => {
    let app;
    let getAllStub;
    let getByStub;
    let getUserByIdStub;
    let createStub;
    let updateStub;

    beforeEach(() => {
        app = express();
        app.use(express.json());
        app.use('/api/adoptions', adoptionsRouter);

        getAllStub = sinon.stub(adoptionsService, 'getAll');
        getByStub = sinon.stub(adoptionsService, 'getBy');
        getUserByIdStub = sinon.stub(usersService, 'getUserById');
        createStub = sinon.stub(adoptionsService, 'create');
        updateStub = sinon.stub(usersService, 'update');
        sinon.stub(petsService, 'getBy');
        sinon.stub(petsService, 'update');
    });

    afterEach(() => {
        sinon.restore();
    });

    describe('GET /api/adoptions', () => {
        it('should return all adoptions successfully', async () => {
            const mockAdoptions = [
                {
                    _id: '507f1f77bcf86cd799439011',
                    owner: '507f1f77bcf86cd799439012',
                    pet: '507f1f77bcf86cd799439013'
                },
                {
                    _id: '507f1f77bcf86cd799439014',
                    owner: '507f1f77bcf86cd799439015',
                    pet: '507f1f77bcf86cd799439016'
                }
            ];

            getAllStub.resolves(mockAdoptions);

            const response = await request(app)
                .get('/api/adoptions')
                .expect(200);

            expect(response.body.status).to.equal('success');
            expect(response.body.payload).to.be.an('array');
            expect(response.body.payload).to.have.length(2);
            expect(getAllStub.calledOnce).to.be.true;
        });

        it('should return empty array when no adoptions exist', async () => {
            getAllStub.resolves([]);

            const response = await request(app)
                .get('/api/adoptions')
                .expect(200);

            expect(response.body.status).to.equal('success');
            expect(response.body.payload).to.be.an('array');
            expect(response.body.payload).to.have.length(0);
        });
    });

    describe('GET /api/adoptions/:aid', () => {
        it('should return a specific adoption by ID', async () => {
            const mockAdoption = {
                _id: '507f1f77bcf86cd799439011',
                owner: '507f1f77bcf86cd799439012',
                pet: '507f1f77bcf86cd799439013'
            };

            getByStub.resolves(mockAdoption);

            const response = await request(app)
                .get('/api/adoptions/507f1f77bcf86cd799439011')
                .expect(200);

            expect(response.body.status).to.equal('success');
            expect(response.body.payload).to.deep.equal(mockAdoption);
            expect(getByStub.calledOnce).to.be.true;
            expect(getByStub.calledWith({ _id: '507f1f77bcf86cd799439011' })).to.be.true;
        });

        it('should return 404 when adoption not found', async () => {
            getByStub.resolves(null);

            const response = await request(app)
                .get('/api/adoptions/507f1f77bcf86cd799439011')
                .expect(404);

            expect(response.body.status).to.equal('error');
            expect(response.body.error).to.equal('Adoption not found');
        });
    });

    describe('POST /api/adoptions/:uid/:pid', () => {
        it('should create an adoption successfully', async () => {
            const mockUser = {
                _id: '507f1f77bcf86cd799439012',
                first_name: 'Juan',
                last_name: 'Pérez',
                email: 'juan@example.com',
                pets: []
            };

            const mockPet = {
                _id: '507f1f77bcf86cd799439013',
                name: 'Max',
                specie: 'Perro',
                adopted: false
            };

            getUserByIdStub.resolves(mockUser);
            petsService.getBy.resolves(mockPet);
            updateStub.resolves(mockUser);
            petsService.update.resolves(mockPet);
            createStub.resolves({
                _id: '507f1f77bcf86cd799439011',
                owner: mockUser._id,
                pet: mockPet._id
            });

            const response = await request(app)
                .post('/api/adoptions/507f1f77bcf86cd799439012/507f1f77bcf86cd799439013')
                .expect(200);

            expect(response.body.status).to.equal('success');
            expect(response.body.message).to.equal('Pet adopted');
            expect(getUserByIdStub.calledOnce).to.be.true;
            expect(petsService.getBy.calledOnce).to.be.true;
            expect(updateStub.calledOnce).to.be.true;
            expect(petsService.update.calledOnce).to.be.true;
            expect(createStub.calledOnce).to.be.true;
        });

        it('should return 404 when user not found', async () => {
            getUserByIdStub.resolves(null);

            const response = await request(app)
                .post('/api/adoptions/507f1f77bcf86cd799439012/507f1f77bcf86cd799439013')
                .expect(404);

            expect(response.body.status).to.equal('error');
            expect(response.body.error).to.equal('user Not found');
            expect(getUserByIdStub.calledOnce).to.be.true;
            expect(petsService.getBy.called).to.be.false;
        });

        it('should return 404 when pet not found', async () => {
            const mockUser = {
                _id: '507f1f77bcf86cd799439012',
                first_name: 'Juan',
                last_name: 'Pérez',
                email: 'juan@example.com',
                pets: []
            };

            getUserByIdStub.resolves(mockUser);
            petsService.getBy.resolves(null);

            const response = await request(app)
                .post('/api/adoptions/507f1f77bcf86cd799439012/507f1f77bcf86cd799439013')
                .expect(404);

            expect(response.body.status).to.equal('error');
            expect(response.body.error).to.equal('Pet not found');
            expect(getUserByIdStub.calledOnce).to.be.true;
            expect(petsService.getBy.calledOnce).to.be.true;
        });

        it('should return 400 when pet is already adopted', async () => {
            const mockUser = {
                _id: '507f1f77bcf86cd799439012',
                first_name: 'Juan',
                last_name: 'Pérez',
                email: 'juan@example.com',
                pets: []
            };

            const mockPet = {
                _id: '507f1f77bcf86cd799439013',
                name: 'Max',
                specie: 'Perro',
                adopted: true
            };

            getUserByIdStub.resolves(mockUser);
            petsService.getBy.resolves(mockPet);

            const response = await request(app)
                .post('/api/adoptions/507f1f77bcf86cd799439012/507f1f77bcf86cd799439013')
                .expect(400);

            expect(response.body.status).to.equal('error');
            expect(response.body.error).to.equal('Pet is already adopted');
            expect(getUserByIdStub.calledOnce).to.be.true;
            expect(petsService.getBy.calledOnce).to.be.true;
            expect(createStub.called).to.be.false;
        });
    });
});
