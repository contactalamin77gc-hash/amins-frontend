import Image from "next/image";

export default function Logo({ color = "text-brand", size = "default" }: { color?: string; size?: string }) {
  const isWhite = color.includes("white");

  return (
    <Image
      src={isWhite ? "/logo-white.png" : "/logo.png"}
      alt="Amin's — Cargo & Shipping"
      width={325}
      height={179}
      className={size === "small" ? "h-[36px] w-auto" : "h-[48px] w-auto"}
      priority
      unoptimized
    />
  );
}