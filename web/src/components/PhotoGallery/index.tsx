'use client';

import { useCallback, useState } from 'react';
import { Lightbox } from '@/components/Lightbox';
import { PhotoMosaic } from '@/components/PhotoMosaic';

interface PhotoGalleryProps {
    photos: string[];
    label: string;
    ratio?: number;
}

export const PhotoGallery = ({ photos, label, ratio }: PhotoGalleryProps) => {
    const [index, setIndex] = useState(-1);
    const close = useCallback(() => setIndex(-1), []);

    return (
        <>
            <PhotoMosaic sources={photos} label={label} ratio={ratio} onOpen={setIndex} />
            {index >= 0 && photos[index] ? (
                <Lightbox photos={photos} index={index} label={label} onClose={close} onNavigate={setIndex} />
            ) : null}
        </>
    );
};
