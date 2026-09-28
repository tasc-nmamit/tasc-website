"use client";

import { useState } from "react";
import Image from "next/image";

interface UserAvatarProps {
  src?: string | null;
  name?: string | null;
  email?: string | null;
  size?: number;
  className?: string;
  fallbackClassName?: string;
}

export default function UserAvatar({
  src,
  name,
  email,
  size = 36,
  className = "rounded-full",
  fallbackClassName = "",
}: UserAvatarProps) {
  const [hasError, setHasError] = useState(false);

  const initial = (name || email || "U")[0]?.toUpperCase() || "U";

  if (!src || hasError) {
    return (
      <div
        style={{ width: size, height: size }}
        className={`flex items-center justify-center rounded-full bg-brand/20 border border-brand/30 font-bold font-mono-tech text-brand-accent shrink-0 select-none ${fallbackClassName}`}
      >
        <span style={{ fontSize: Math.max(10, Math.floor(size * 0.38)) }}>
          {initial}
        </span>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={name || "User avatar"}
      width={size}
      height={size}
      unoptimized
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      className={`${className} shrink-0 object-cover`}
    />
  );
}
