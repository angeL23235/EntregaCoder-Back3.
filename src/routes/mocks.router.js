import { Router } from 'express';
import { generateMockUsers, generateMockPets } from '../utils/mocking.js';
import { usersService, petsService } from '../services/index.js';

const router = Router();

router.get('/mockingpets', (req, res) => {
    const quantity = 50;
    const pets = generateMockPets(quantity);
    res.send({ status: 'success', payload: pets });
});

router.get('/mockingusers', async (req, res) => {
    try {
        const quantity = 50;
        const users = await generateMockUsers(quantity, true);
        res.send({ status: 'success', payload: users });
    } catch (error) {
        res.status(500).send({ status: 'error', error: error.message });
    }
});

router.post('/generateData', async (req, res) => {
    try {
        const { users: usersQuantity, pets: petsQuantity } = req.body;
        
        if (!usersQuantity && !petsQuantity) {
            return res.status(400).send({ 
                status: 'error', 
                error: 'Debe proporcionar al menos un parámetro: users o pets' 
            });
        }

        const results = {
            users: null,
            pets: null
        };

        if (usersQuantity && usersQuantity > 0) {
            const mockUsers = await generateMockUsers(usersQuantity);
            const insertedUsers = await Promise.all(
                mockUsers.map(user => usersService.create(user))
            );
            results.users = {
                quantity: insertedUsers.length,
                data: insertedUsers
            };
        }

        if (petsQuantity && petsQuantity > 0) {
            const mockPets = generateMockPets(petsQuantity);
            const insertedPets = await Promise.all(
                mockPets.map(pet => petsService.create(pet))
            );
            results.pets = {
                quantity: insertedPets.length,
                data: insertedPets
            };
        }

        res.send({ 
            status: 'success', 
            message: 'Datos generados e insertados correctamente',
            payload: results
        });
    } catch (error) {
        res.status(500).send({ status: 'error', error: error.message });
    }
});

export default router;

