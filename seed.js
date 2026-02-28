import bcrypt from 'bcryptjs';
import prisma from './src/services/db.js';

async function seed() {
  const email = 'admin@gmail.com';
  const password = 'admin123';
  const storeName = 'Shopora Admin Store';

  try {
    console.log('--- Démarrage du Seeding Admin ---');

    // 1. Nettoyage si l'utilisateur existe déjà (optionnel, pour éviter les erreurs d'unicité)
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      console.log(`L'utilisateur ${email} existe déjà. Mise à jour du mot de passe...`);
      const hashedPassword = await bcrypt.hash(password, 10);
      await prisma.user.update({
        where: { email },
        data: { password: hashedPassword }
      });
    } else {
      // 2. Hashage du mot de passe
      const hashedPassword = await bcrypt.hash(password, 10);

      // 3. Création du Store par défaut
      const store = await prisma.store.create({
        data: {
          name: storeName,
          email: email
        }
      });

      // 4. Création de l'admin
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
      console.log(`✅ Admin créé avec succès : ${email}`);
    }

    console.log('--- Seeding terminé ---');
  } catch (error) {
    console.error('❌ Erreur lors du seeding :', error);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
