"use client";

import { useState } from "react";

type ProfileAvatarProps = { src: string | null | undefined; name: string; className?: string; imageClassName?: string };

export function ProfileAvatar({ src, name, className = "", imageClassName = "" }: ProfileAvatarProps) {
  const [failed, setFailed] = useState(false);
  const initials = name.split(" ").filter(Boolean).map((part) => part[0]).join("").slice(0, 2).toUpperCase() || "EL";
  return <span className={`relative grid shrink-0 place-items-center overflow-hidden rounded-full bg-[#e5f4f6] font-bold text-[#0e5e6f] ${className}`}>{src && !failed ? <img src={src} alt={`Fotografia de profil a lui ${name}`} onError={() => setFailed(true)} className={`h-full w-full object-cover ${imageClassName}`} /> : initials}</span>;
}
