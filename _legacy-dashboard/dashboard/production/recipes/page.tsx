import React from 'react'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth/next'
import { RecipeManagement } from '@/components/production/RecipeManagement'

export default async function RecipesPage() {
  const session = await auth()

  if (!session || !session.user?.id) {
    redirect('/auth/signin')
  }

  return (
    <div className="container mx-auto p-6">
      <RecipeManagement
        organizationId={session.user.organizationId}
        currentUserId={session.user.id}
      />
    </div>
  )
}