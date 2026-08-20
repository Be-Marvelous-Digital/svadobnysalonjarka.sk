import { Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { ScrollToTop } from '@/components/ScrollToTop';
import { AdminPage } from '@/pages/AdminPage';
import { AboutPage } from '@/pages/AboutPage';
import { CollectionPage } from '@/pages/CollectionPage';
import { ContactPage } from '@/pages/ContactPage';
import { HomePage } from '@/pages/HomePage';
import { PricesPage } from '@/pages/PricesPage';
import { PrivacyPage } from '@/pages/PrivacyPage';
import { ReservationPage } from '@/pages/ReservationPage';
import { TermsPage } from '@/pages/TermsPage';
import { ROUTES } from '@/utils/routes';

export const App = () => (
    <>
        <ScrollToTop />
        <Routes>
            <Route element={<Layout />}>
                <Route path={ROUTES.home} element={<HomePage />} />
                <Route path="/kolekcia/:key" element={<CollectionPage />} />
                <Route path={ROUTES.prices} element={<PricesPage />} />
                <Route path={ROUTES.about} element={<AboutPage />} />
                <Route path={ROUTES.contact} element={<ContactPage />} />
                <Route path={ROUTES.reservation} element={<ReservationPage />} />
                <Route path={ROUTES.privacy} element={<PrivacyPage />} />
                <Route path={ROUTES.terms} element={<TermsPage />} />
                <Route path={ROUTES.admin} element={<AdminPage />} />
                <Route path="*" element={<Navigate to={ROUTES.home} replace />} />
            </Route>
        </Routes>
    </>
);
