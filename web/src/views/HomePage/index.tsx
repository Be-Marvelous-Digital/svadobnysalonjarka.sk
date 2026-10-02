import { StructuredData } from '@/components/StructuredData';
import { CollectionsSection } from '@/components/home/CollectionsSection';
import { CtaSection } from '@/components/home/CtaSection';
import { GroomSection } from '@/components/home/GroomSection';
import { HeroSection } from '@/components/home/HeroSection';
import { SocialSection } from '@/components/home/SocialSection';
import { StepsSection } from '@/components/home/StepsSection';
import { StorySection } from '@/components/home/StorySection';
import { VenueSection } from '@/components/home/VenueSection';
import { TestimonialsSection } from '@/components/home/TestimonialsSection';
import { LOCAL_BUSINESS_SCHEMA } from '@/data/schema';
import type { SiteImages } from '@/data/siteImages';

interface HomePageProps {
    images: SiteImages;
    instagram: string[];
}

export const HomePage = ({ images, instagram }: HomePageProps) => (
    <>
        <StructuredData schema={LOCAL_BUSINESS_SCHEMA} />
        <HeroSection />
        <CollectionsSection images={images} />
        <StepsSection />
        <StorySection images={images} />
        <VenueSection images={images} />
        <GroomSection images={images} />
        <TestimonialsSection />
        <SocialSection photos={instagram} />
        <CtaSection />
    </>
);
