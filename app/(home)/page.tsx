import { getCurrentUsersCount } from "@/actions/users/getCurrentUserCount";
import CustomizationCard from "@/components/frontend/customisation-card";
import FAQ from "@/components/frontend/FAQ";
import Showcase from "@/components/frontend/showcase";
import PricingCard from "@/components/frontend/single-tier-pricing";
import FeatureTabs from "@/components/frontend/SmoothTabs";
import TechStackGrid from "@/components/frontend/Techstack";
import { BorderBeam } from "@/components/magicui/border-beam";
import { GridBackground } from "@/components/reusable-ui/grid-background";
import ProjectComparison from "@/components/reusable-ui/project-comparison";
import ReUsableHero from "@/components/reusable-ui/reusable-hero";
import {
  Code2,
  Layout,
  Rocket
} from "lucide-react";
import Image from "next/image";
import Iframe from "react-iframe";
 
 const page=async()=> {
  const currentUsers =  await getCurrentUsersCount();
  return (
    <section>
      <ReUsableHero
        theme="dark"
        announcement={{
          text: "Manage your business with ease",
        }}
        title={
          <>
           Empowering Businesses with Effortless and efficient Inventory and sales processes
          </>
        }
        mobileTitle="Ultimate Next.js Agency & SaaS Kit"
        subtitle="Optimize your inventory with our software—offering real-time tracking, automated processes, and seamless integration. Eliminate errors, enhance efficiency, and gain actionable insights to drive smarter decisions. Designed for businesses of all sizes, our solution ensures precision, scalability, and profitability. Revolutionize your stock management and sales process today with ease and confidence. Never run out of essential goods, real-time stock updates at your fingertips and make data-driven inventory decisions"
        buttons={[
          {
            // label: "Register your Enterprise now and start enjoying the benefits",
            label: "Register your Enterprise now to enjoy the benefits",
            href: "https://gmukejohnbaptist.gumroad.com/l/hubstack-simple-auth",
            primary: true,
          },
          {
            label: "View Demo",
            href: "/#demo",
          },
        ]}
        icons={[
          { icon: Code2, position: "left" },
          { icon: Layout, position: "right" }, // Changed to Layout for dashboard representation
          { icon: Rocket, position: "center" }, // Changed to Rocket for launch/speed representation
        ]}
        backgroundStyle="red"
        className="min-h-[70vh]"
        userCount={currentUsers > 1 ? currentUsers : null}
      />
      <GridBackground>
        <div className="px-8 py-16 ">
          <TechStackGrid />
        </div>
      </GridBackground>
      <div className="py-16 max-w-6xl mx-auto px-8">
        <div className="relative rounded-lg overflow-hidden">
          <BorderBeam />
          <Image
            src="/images/dash-2.webp"
            alt="This is the dashbaord Image"
            width={1775}
            height={1109}
            className="w-full h-full rounded-lg object-cover  border shadow-2xl"
          />
        </div>
      </div>
      <ProjectComparison />
      <GridBackground className="">
        <FeatureTabs />
      </GridBackground>

      <div id="demo" className="py-16 max-w-6xl mx-auto relative">
        <Iframe
          url="https://www.youtube.com/embed/TcyKfjikcIA?si=naix1jg9I2r0CnSu"
          width="100%"
          className="h-[32rem] rounded-lg"
          display="block"
          position="relative"
        />
        <div className="pb-16">
          <Showcase />
        </div>
        <div className="py-8">
          <PricingCard />
        </div>
        <div className="py">
          <CustomizationCard theme="dark" />
        </div>
      </div>
      <FAQ />
    </section>
  );
}
export default page