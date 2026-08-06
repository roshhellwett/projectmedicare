import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Janta Medicare",
    short_name: "Janta Medicare",
    description: "Sirf Janta Kay Liye - Pharmacy, Pathology & Doctor Consultations in Howrah, West Bengal.",
    start_url: "/en",
    display: "standalone",
    background_color: "#fbfcfd",
    theme_color: "#1B6FB3",
    icons: [
      {
        src: "/websitelogo/jantamedicarelogo.webp",
        sizes: "192x192",
        type: "image/webp",
      },
      {
        src: "/websitelogo/jantamedicarelogo.webp",
        sizes: "512x512",
        type: "image/webp",
      },
    ],
  };
}
