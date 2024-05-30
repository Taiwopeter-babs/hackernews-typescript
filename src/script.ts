import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    const newLink = await prisma.link.create({
        data: {
            description: 'Full stack tutorial for GraphQL',
            url: 'www.howtographql.com'
        }
    });
    
    const allLinks = await prisma.link.findMany();
    console.log(allLinks);
}

main()
.catch((e) => {throw e})
.finally( async () => {
    await prisma.$disconnect();
})