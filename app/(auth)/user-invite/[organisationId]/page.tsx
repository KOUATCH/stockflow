"use client";

import InvitedUserRegistration from "@/components/Forms/InvitedUserRegistration";
import { GridBackground } from "@/components/reusable-ui/grid-background";

const Page = async ({ params, searchParams }: {
  params: Promise<{ organizationId: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined, email: string }>
}

) => {

  const { organizationId } = await params
  const email = (await searchParams).email as string
  const roleId = (await searchParams).roleId as string
  const organizationName = (await searchParams).organizationName as string
  console.log({ organizationId })
  return (
    <GridBackground>
      <div className="px-4">
        <InvitedUserRegistration email={email} roleId={roleId} organizationName={organizationName} organizationId={organizationId} />
      </div>
    </GridBackground>
  );
}
export default Page