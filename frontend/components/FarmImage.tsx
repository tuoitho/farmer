"use client";

import Image from "next/image";
import { useState } from "react";

interface FarmImageProps {
    src?: string;
    alt: string;
    fallbackSrc?: string;
}

export default function FarmImage({
    src,
    alt,
    fallbackSrc = "https://placehold.co/600x400.png"
}: FarmImageProps) {
    const [error, setError] = useState(false);

    return (
        <Image
            alt={alt}
            src={error || !src ? fallbackSrc : src}
            fill
            className="object-cover"
            onError={() => setError(true)}
        />
    );
}
