import Link from 'next/link';
import { LegalPage } from '@/components/LegalPage';
import { TERMS_SECTIONS } from '@/data/legal';
import { ROUTES } from '@/utils/routes';

export const TermsPage = () => {
    return (
        <LegalPage
            kicker="Právne informácie"
            title="Zásady používania"
            lead="Čo od tejto stránky čakať a čo nie. Najdôležitejšie: odoslaním formulára o termín žiadate, potvrdí ho až majiteľka telefonicky alebo e-mailom."
            sections={TERMS_SECTIONS}
            footnote={
                <span>
                    Spracúvanie osobných údajov popisujú <Link href={ROUTES.privacy}>Zásady ochrany súkromia</Link>.
                </span>
            }
        />
    );
};
