export type Store = {
  id: string;
  name: string;
  tagline: string;
  address: string;
  phones: { label: string; number: string }[];
  services: string[];
  isMainHub: boolean;
  mapQuery: string;
  mapUrl?: string;
};

export const stores: Store[] = [
  {
    id: "vivekvihar",
    name: "Vivek Vihar Main Hub",
    tagline: "Main Branch · Pharmacy & Pathology",
    address:
      "493/C/A, G. T. Road (South), Fazir Bazar More, Vivek Vihar Phase-II, Shop No. 4, P.O. & P.S. Shibpur, Dist. Howrah, Pin: 711101",
    phones: [
      { label: "Pharmacy", number: "+918240804490" },
      { label: "Diagnostic", number: "+918100518482" },
    ],
    services: ["Pharmacy", "Pathology"],
    isMainHub: true,
    mapQuery:
      "493 G T Road South Fazir Bazar More Vivek Vihar Phase II Howrah 711101",
    mapUrl: "https://maps.app.goo.gl/zHZvuowxANBXK5rQ9?g_st=iw",
  },
  {
    id: "shibpur",
    name: "Shibpur Store",
    tagline: "Pharmacy, Pathology & Doctor Chambers",
    address:
      "53, Kalikumar Mukharjee Lane, Tram Depot More, P.O. & P.S. Shibpur, D.T. Howrah, Pin: 711102",
    phones: [
      { label: "Pharmacy", number: "+919007013572" },
      { label: "Diagnostic & Appointment", number: "+916290745327" },
    ],
    services: ["Pharmacy", "Pathology", "Doctor Chambers"],
    isMainHub: false,
    mapQuery: "53 Kalikumar Mukharjee Lane Shibpur Howrah 711102",
  },
  {
    id: "pilkhana",
    name: "Pilkhana Store",
    tagline: "Pharmacy & Pathology",
    address:
      "67/A, G. T. Road (North), Oriya Para More, Pilkhana, Salkia, Howrah - 711106, West Bengal",
    phones: [
      { label: "Pharmacy", number: "+919123899472" },
      { label: "Diagnostic", number: "+919123890747" },
    ],
    services: ["Pharmacy", "Pathology"],
    isMainHub: false,
    mapQuery:
      "67A G T Road North Oriya Para More Pilkhana Salkia Howrah 711106",
    mapUrl: "https://maps.app.goo.gl/XsZcrW8Yd2SgkMEv8?g_st=iw",
  },
];

export const mainContact = {
  tollFree: "+916290745327",
  diagnostic: "+916290745327",
};
