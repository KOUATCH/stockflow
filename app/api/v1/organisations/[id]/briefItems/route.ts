import { db } from "@/prisma/db";
import { NextRequest } from "next/server";

// export async function GET(
//     request: NextRequest,
//     { params }: { params: Promise<{ id: string }> }
// ) {
//     try {
//         const orgId = (await params).id
//         // Fetch items for the organization
//         const briefItems=await getBriefOrgItems(orgId)
//         return new Response(JSON.stringify(briefItems), {
//             status: 200,
//             // headers: { 'Content-Type': 'application/json' }
//         });
//     } catch (error) {
//         console.error("Error fetching the count:", error);
//         if (typeof error === 'object' && error !== null) {
//             console.log(Object.keys(error));
//         }
//         return {
//             status: 500,
//             body: JSON.stringify({ error: "Internal Server Error" })
//         };

//     }
// }




export const GET = async (
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) => {


    try {
        const orgId = (await params).id;
        // parse pagination parameters from url
        const searchParams = request.nextUrl.searchParams;
        const pageParams = parseInt(searchParams.get('page') || '1', 10);
        const limitParams = parseInt(searchParams.get('limit') || '10', 10);


        // check if pagination is requested
        const isPagination = pageParams > 0 && limitParams > 0;
        // const isPagination= pageParams !== null && limitParams !== null;

        if (isPagination) {
            // Fetch items for the organization with pagination
            const page = pageParams;
            const limit = limitParams;
            const skip = (page - 1) * limit;

            // Execute queries in parallel for efficiency
            const [items, totalCount] = await Promise.all([
                db.item.findMany({
                    where: { organizationId: orgId },
                    orderBy: {
                        createdAt: 'desc'
                    },
                    select: {
                        id: true,
                        name: true,
                        createdAt: true,
                        thumbnail: true,
                        costPrice: true,
                        sellingPrice: true,
                        slug: true,

                    },
                    skip: skip,
                    take: limit
                }),
                db.item.count({ where: { organizationId: orgId } })
            ]);

            // Calculate pagination metadata
            const totalPages = Math.ceil(totalCount / limit);
            //  construct response with data and pagination
            const response = {
                data: items,
                pagination: {
                    itemCount: totalCount,
                    page,
                    limit,
                    totalPages
                }
            };
            return new Response(JSON.stringify(response), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        } else {
            // return all items without PaginationOptions
            const items = await db.item.findMany({
                where: {
                    organizationId: orgId
                },
                select: {
                    id: true,
                    name: true,
                    createdAt: true,
                    thumbnail: true,
                    costPrice: true,
                    sellingPrice: true,
                    slug: true,

                },

                orderBy: {
                    createdAt: 'desc'
                }
            });
            const response = {
                data: items,
                pagination: {
                    itemCount: items.length,
                    page: 1,
                    limit: items.length,
                    totalPages: 1

                }
            };
            return new Response(JSON.stringify(response), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        }
    } catch (error) {
        console.error('ItemService error:', error);
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