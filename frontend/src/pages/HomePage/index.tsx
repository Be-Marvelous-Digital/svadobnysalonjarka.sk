import { StructuredData } from '@/components/StructuredData';
import { CollectionsSection } from '@/components/home/CollectionsSection';
import { CtaSection } from '@/components/home/CtaSection';
import { GroomSection } from '@/components/home/GroomSection';
import { HeroSection } from '@/components/home/HeroSection';
import { SocialSection } from '@/components/home/SocialSection';
import { StepsSection } from '@/components/home/StepsSection';
import { StorySection } from '@/components/home/StorySection';
import { TestimonialsSection } from '@/components/home/TestimonialsSection';
import { LOCAL_BUSINESS_SCHEMA } from '@/data/schema';
import { usePageMeta } from '@/hooks/usePageMeta';

export const HomePage = () => {
    usePageMeta({
        title: 'Svadobný salón Jarka Galanta — svadobné a spoločenské šaty',
        description:
            'Svadobné, spoločenské a prijímacie šaty, obleky pre ženíchov aj doplnky. Salón v Galante od roku 2007. Objednajte si termín skúšky.',
    });

    return (
        <>
            <StructuredData id="schema-salon" schema={LOCAL_BUSINESS_SCHEMA} />
            <HeroSection />
            <CollectionsSection />
            <StepsSection />
            <StorySection />
            <GroomSection />
            <TestimonialsSection />
            <SocialSection />
            <CtaSection />
        </>
    );
};
