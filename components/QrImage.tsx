import { useEffect, useState } from "react";
import QRCode from "qrcode";

/** Renders a QR code for the given value as an <img>, generated client-side. */
export default function QrImage({
  value,
  size = 168,
}: {
  value: string;
  size?: number;
}) {
  const [src, setSrc] = useState<string>("");

  useEffect(() => {
    QRCode.toDataURL(value, {
      width: size,
      margin: 1,
      color: { dark: "#0a0612", light: "#ffffff" },
    })
      .then(setSrc)
      .catch(() => setSrc(""));
  }, [value, size]);

  if (!src) {
    return (
      <div
        style={{ width: size, height: size }}
        className="animate-pulse rounded-xl bg-white/10"
      />
    );
  }
  return (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      src={src}
      alt="Ticket QR code"
      width={size}
      height={size}
      className="rounded-xl bg-white p-2"
    />
  );
}
