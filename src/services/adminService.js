import bcrypt from 'bcryptjs';
import prisma from './db.js';

export const checkAndSeedAdmin = async () => {
    const email = 'admin@gmail.com';
    const password = 'admin123';
    const storeName = 'Shopora Admin Store';

    try {
        const existingUser = await prisma.user.findUnique({ where: { email } });
        
        if (!existingUser) {
            console.log('--- Création automatique de l\'admin SuperAdmin ---');
            const hashedPassword = await bcrypt.hash(password, 10);

            // 1. Création du Store par défaut
            const store = await prisma.store.create({
                data: {
                    name: storeName,
                    email: email
                }
            });

            // 2. Création de l'admin
            await prisma.user.create({
                data: {
                    email,
                    password: hashedPassword,
                    username: 'admin',
                    accountType: 'COMPANY',
                    role: 'ADMIN',
                    storeId: store.id
                }
            });
            console.log(`✅ SuperAdmin créé : ${email}`);
        } else {
            // Optionnel : s'assurer que le mdp est toujours admin123 pour la démo
            const isMatch = await bcrypt.compare(password, existingUser.password);
            if (!isMatch) {
                const hashedPassword = await bcrypt.hash(password, 10);
                await prisma.user.update({
                    where: { email },
                    data: { password: hashedPassword }
                });
                console.log('🔄 Mot de passe SuperAdmin réinitialisé.');
            }
        }
    } catch (error) {
        console.error('❌ Erreur lors de la vérification de l\'admin :', error);
    }
};
