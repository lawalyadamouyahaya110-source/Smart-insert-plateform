import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Smart Insert",
    short_name: "Smart Insert",
    description: "Plateforme de recrutement et de formation, optimisee pour une utilisation mobile sur Android.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#f7f3ee",
    theme_color: "#ea7b24",
    categories: ["business", "productivity", "education"],
    lang: "fr",
    icons: [
      {
        src: "/apple-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
    shortcuts: [
      {
        name: "Offres",
        short_name: "Offres",
        url: "/offres",
      },
      {
        name: "Connexion",
        short_name: "Connexion",
        url: "/connexion",
      },
      {
        name: "Formations",
        short_name: "Formations",
        url: "/formations",
      },
    ],
  }
}
