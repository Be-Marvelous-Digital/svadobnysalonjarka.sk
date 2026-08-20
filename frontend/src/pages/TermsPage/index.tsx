import { Link } from 'react-router-dom';
import { LegalPage } from '@/components/LegalPage';
import { TERMS_SECTIONS } from '@/data/legal';
import { usePageMeta } from '@/hooks/usePageMeta';
import { ROUTES } from '@/utils/routes';

export const TermsPage = () => {
    usePageMeta({
        title: 'Zásady používania — Svadobný salón Jarka Galanta',
        description:
            'Podmienky používania stránky svadobného salónu Jarka: na čo slúži rezervačný formulár, ako fungujú orientačné ceny a autorské práva k fotografiám.',
    });

    return (
        <LegalPage
            kicker="Právne informácie"
            title="Zásady používania"
            lead="Čo od tejto stránky čakať a čo nie. Najdôležitejšie: odoslaním formulára o termín žiadate, potvrdí ho až telefonát od majiteľky."
            sections={TERMS_SECTIONS}
            footnote={
                <span>
                    Spracúvanie osobných údajov popisujú <Link to={ROUTES.privacy}>Zásady ochrany súkromia</Link>.
                </span>
            }
        />
    );
};
