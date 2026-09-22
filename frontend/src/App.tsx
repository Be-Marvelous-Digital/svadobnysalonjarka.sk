import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { ScrollToTop } from '@/components/ScrollToTop';
import { AboutPage } from '@/pages/AboutPage';
import { CollectionPage } from '@/pages/CollectionPage';
import { ContactPage } from '@/pages/ContactPage';
import { HomePage } from '@/pages/HomePage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { PricesPage } from '@/pages/PricesPage';
import { PrivacyPage } from '@/pages/PrivacyPage';
import { ReservationPage } from '@/pages/ReservationPage';
import { TermsPage } from '@/pages/TermsPage';
import { VenuePage } from '@/pages/VenuePage';
import { ROUTES } from '@/utils/routes';

// The back office is a third of the source and nobody browsing dresses will ever
// open it, so it loads on demand instead of riding along in the public bundle.
const AdminPage = lazy(() => import('@/pages/AdminPage').then((module) => ({ default: module.AdminPage })));

export const App = () => (
    <>
        <ScrollToTop />
        <Routes>
            <Route element={<Layout />}>
                <Route path={ROUTES.home} element={<HomePage />} />
                <Route path="/kolekcia/:key" element={<CollectionPage />} />
                <Route path={ROUTES.prices} element={<PricesPage />} />
                <Route path={ROUTES.about} element={<AboutPage />} />
                <Route path={ROUTES.venue} element={<VenuePage />} />
                <Route path={ROUTES.contact} element={<ContactPage />} />
                <Route path={ROUTES.reservation} element={<ReservationPage />} />
                <Route path={ROUTES.privacy} element={<PrivacyPage />} />
                <Route path={ROUTES.terms} element={<TermsPage />} />
                <Route
                    path={ROUTES.admin}
                    element={
                        <Suspense fallback={null}>
                            <AdminPage />
                        </Suspense>
                    }
                />
                <Route path="*" element={<NotFoundPage />} />
            </Route>
        </Routes>
    </>
);
