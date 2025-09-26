import { db } from "@/prisma/db";

export async function GET(request: Request) {
    try {

        // Fetch items for the organization
      
        const items = await db.item.findMany({
          
            orderBy: {
                name: "desc",
            },
        });
        return new Response(JSON.stringify(items), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error("Error fetching the count:", error);
        if (typeof error === 'object' && error !== null) {
            console.log(Object.keys(error));
        }
        return {
            status: 500,
            body: JSON.stringify({ error: "Internal Server Error" })
        };

    }
}

export async function POST(request: Request) {
    // Parse the request body
    const body = await request.json();
    const { name } = body;

    // e.g. Insert new user into your DB
    const newUser = { id: Date.now(), name };

    return new Response(JSON.stringify(newUser), {
        status: 201,
        headers: { 'Content-Type': 'application/json' }
    });
}