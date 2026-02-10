"use client";

import { useEffect, useState } from "react";

const SAMPLE_SIZE = 40;
const FALLBACK_PRIMARY = "#a78bfa";
const FALLBACK_SECONDARY = "#7c3aed";

function rgbToHex(r: number, g: number, b: number): string {
  return (
    "#" +
    [r, g, b]
      .map((x) => Math.max(0, Math.min(255, Math.round(x))).toString(16).padStart(2, "0"))
      .join("")
  );
}

/** Escurece uma cor hex para uso como fundo legível */
function darkenHex(hex: string, factor: number): string {
  const n = parseInt(hex.slice(1), 16);
  const r = ((n >> 16) & 0xff) * factor;
  const g = ((n >> 8) & 0xff) * factor;
  const b = (n & 0xff) * factor;
  return rgbToHex(r, g, b);
}

export type ImageColors = {
  primary: string;
  secondary: string;
};

export function useImageColors(imageUrl: string | undefined): ImageColors {
  const [colors, setColors] = useState<ImageColors>({
    primary: FALLBACK_PRIMARY,
    secondary: FALLBACK_SECONDARY,
  });

  useEffect(() => {
    if (!imageUrl) {
      setColors({ primary: FALLBACK_PRIMARY, secondary: FALLBACK_SECONDARY });
      return;
    }

    let cancelled = false;
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      if (cancelled) return;
      try {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        const size = Math.min(SAMPLE_SIZE, img.width, img.height);
        canvas.width = size;
        canvas.height = size;
        ctx.drawImage(img, 0, 0, size, size);
        const data = ctx.getImageData(0, 0, size, size).data;

        let r1 = 0, g1 = 0, b1 = 0, r2 = 0, g2 = 0, b2 = 0, c1 = 0, c2 = 0;
        const step = 4;
        for (let i = 0; i < data.length; i += step) {
          const x = (i / step) % size;
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const a = data[i + 3];
          if (a < 128) continue;
          if (x < size / 2) {
            r1 += r;
            g1 += g;
            b1 += b;
            c1++;
          } else {
            r2 += r;
            g2 += g;
            b2 += b;
            c2++;
          }
        }
        if (c1 > 0 && c2 > 0) {
          const p = rgbToHex(r1 / c1, g1 / c1, b1 / c1);
          const s = rgbToHex(r2 / c2, g2 / c2, b2 / c2);
          setColors({
            primary: p,
            secondary: darkenHex(s, 0.6),
          });
        } else {
          let r = 0, g = 0, b = 0, c = 0;
          for (let i = 0; i < data.length; i += step) {
            if (data[i + 3] < 128) continue;
            r += data[i];
            g += data[i + 1];
            b += data[i + 2];
            c++;
          }
          if (c > 0) {
            const p = rgbToHex(r / c, g / c, b / c);
            setColors({
              primary: p,
              secondary: darkenHex(p, 0.5),
            });
          }
        }
      } catch {
        setColors({
          primary: FALLBACK_PRIMARY,
          secondary: FALLBACK_SECONDARY,
        });
      }
    };

    img.onerror = () => {
      if (!cancelled)
        setColors({
          primary: FALLBACK_PRIMARY,
          secondary: FALLBACK_SECONDARY,
        });
    };

    img.src = imageUrl;
    return () => {
      cancelled = true;
      img.src = "";
    };
  }, [imageUrl]);

  return colors;
}
