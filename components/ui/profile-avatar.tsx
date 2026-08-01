"use client";

import { useState } from "react";

type ProfileAvatarProps = { src: string | null | undefined; name: string; className?: string; imageClassName?: string };

export function ProfileAvatar({ src, name, className = "", imageClassName = "" }: ProfileAvatarProps) {
  const [failed, setFailed] = useState(false);
  const showImage = !failed && Boolean(src);
  const initials = name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "EL";

  return (
    <span className={`relative grid shrink-0 place-items-center overflow-hidden rounded-full bg-[#e5f4f6] ${className}`}>
      {showImage && src ? (
        <img
          src={src}
          alt={`Fotografia de profil a lui ${name}`}
          onError={() => setFailed(true)}
          className={`h-full w-full object-cover ${imageClassName}`}
        />
      ) : (
        <span aria-label={`Inițialele lui ${name}`} className="text-sm font-extrabold text-[#0e5e6f]">
          {initials}
        </span>
      )}
    </span>
  );
}
