export const runtime = 'nodejs'

export async function GET() {
  return Response.json({ message: "API working", timestamp: new Date().toISOString() })
}