import mongoose from 'mongoose';
import { createHash } from './index.js';

export const generateMockUsers = async (quantity, includeId = false) => {
    const users = [];
    const hashedPassword = await createHash('coder123');
    const roles = ['user', 'admin'];
    
    for (let i = 0; i < quantity; i++) {
        const role = roles[Math.floor(Math.random() * roles.length)];
        const user = {
            first_name: `Usuario${i + 1}`,
            last_name: `Apellido${i + 1}`,
            email: `usuario${i + 1}@mock.com`,
            password: hashedPassword,
            role: role,
            pets: []
        };
        
        if (includeId) {
            user._id = new mongoose.Types.ObjectId();
        }
        
        users.push(user);
    }
    
    return users;
};

export const generateMockPets = (quantity) => {
    const pets = [];
    const species = ['Perro', 'Gato', 'Conejo', 'Hamster', 'Pájaro'];
    const names = ['Max', 'Luna', 'Bella', 'Charlie', 'Lucy', 'Cooper', 'Daisy', 'Milo', 'Lola', 'Rocky'];
    
    for (let i = 0; i < quantity; i++) {
        const pet = {
            name: `${names[i % names.length]}${i + 1}`,
            specie: species[i % species.length],
            birthDate: new Date(2020 + (i % 4), i % 12, (i % 28) + 1),
            adopted: false
        };
        pets.push(pet);
    }
    
    return pets;
};

