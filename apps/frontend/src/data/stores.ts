export type Store = {
  id: string;
  name: string;
  tagline: string;
  address: string;
  phones: { label: string; number: string }[];
  services: string[];
  isMainHub: boolean;
  mapQuery: string;
};

export const stores: Store[] = [
  {
    id: "shibpur",
    name: "Shibpur Main Hub",
    tagline: "Main Branch · Doctor Chambers",
    address:
      "53, Kalikumar Mukharjee Lane, Tram Depot More, P.O. & P.S. Shibpur, D.T. Howrah, Pin: 711102",
    phones: [
      { label: "Pharmacy", number: "+919007013572" },
      { label: "Diagnostic & Appointment", number: "+916290745327" },
    ],
    services: ["Pharmacy", "Pathology", "Doctor Chambers"],
    isMainHub: true,
    mapQuery: "53 Kalikumar Mukharjee Lane Shibpur Howrah 711102",
  },
  {
    id: "vivekvihar",
    name: "Vivek Vihar Store",
    tagline: "Pharmacy & Pathology",
    address:
      "493/C/A, G. T. Road (South), Fazir Bazar More, Vivek Vihar Phase-II, Shop No. 4, P.O. & P.S. Shibpur, Dist. Howrah, Pin: 711101",
    phones: [{ label: "Store", number: "+918240804490" }],
    services: ["Pharmacy", "Pathology"],
    isMainHub: false,
    mapQuery:
      "493 G T Road South Fazir Bazar More Vivek Vihar Phase II Howrah 711101",
  },
  {
    id: "pilkhana",
    name: "Pilkhana Store",
    tagline: "Pharmacy & Pathology",
    address:
      "67/A, G. T. Road (North), Oriya Para More, Pilkhana, Salkia, Howrah - 711106, West Bengal",
    phones: [{ label: "Store", number: "+919123899472" }],
    services: ["Pharmacy", "Pathology"],
    isMainHub: false,
    mapQuery:
      "67A G T Road North Oriya Para More Pilkhana Salkia Howrah 711106",
  },
];

export const mainContact = {
  tollFree: "+916290745327",
  diagnostic: "+916290745327",
};
