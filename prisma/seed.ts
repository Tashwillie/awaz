import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');
  
  const demoSession = await prisma.demoSession.create({
    data: {
      status: 'READY',
      ttlExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      provider: 'retell',
      requestId: 'seed-request',
    },
  });
  
  await prisma.lead.create({
    data: {
      demoSessionId: demoSession.id,
      name: 'Test User',
      email: 'test@example.com',
      phoneE164: '+1234567890',
      consent: true,
    },
  });
  
  await prisma.businessContext.create({
    data: {
      demoSessionId: demoSession.id,
      placeId: 'test-place-id',
      name: 'Test Business',
      address: '123 Test St, Test City, TC 12345',
      website: 'https://testbusiness.com',
      phone: '+1234567890',
      types: ['plumber', 'home_services'],
      rating: 4.5,
      userRatings: 100,
    },
  });
  
  await prisma.businessProfile.create({
    data: {
      demoSessionId: demoSession.id,
      json: {
        business_profile: {
          brand_voice: 'Professional plumbing services',
          services: ['Emergency plumbing', 'Pipe repair', 'Drain cleaning'],
          coverage_area: 'Test City',
          pricing_notes: ['Free estimates', 'Senior discounts'],
          booking_rules: ['24-hour cancellation policy'],
          faqs: ['What are your hours?', 'Do you offer emergency service?'],
          qualifying_questions: ['What type of service do you need?'],
          prohibited_claims: ['Cannot guarantee specific outcomes'],
        },
      },
    },
  });
  
  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });







