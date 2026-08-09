const fs = require("fs");

const enPath = "messages/en.json";
const hiPath = "messages/hi.json";

const en = JSON.parse(fs.readFileSync(enPath, "utf-8"));
const hi = JSON.parse(fs.readFileSync(hiPath, "utf-8"));

// 1. Add Footer keys
en.Footer = {
  ...en.Footer,
  tagline: "Sirf Janta Kay Liye",
  mainHubLabel: "Main hub — Vivek Vihar",
  mainHubAddress: "493/C/A, G. T. Road (South), Fazir Bazar More, Vivek Vihar Phase-II, Shop No. 4, P.O. & P.S. Shibpur, Dist. Howrah, Pin: 711101",
  openDaily: "Open daily 8 AM – 10 PM",
  servicesTitle: "Services",
  quickLinksTitle: "Quick links",
  legalTitle: "Legal",
  designBy: "Design and Build By",
  pharmacy: "Pharmacy",
  pathology: "Pathology & Diagnostics",
  doctorChambers: "Doctor Chambers",
  productsOffers: "Products & Offers",
  storeLocations: "Store Locations",
  ourDoctors: "Our Doctors",
  rateChart: "Patient Rate Chart",
  leaveFeedback: "Leave Feedback",
  facebookPage: "Facebook page",
  privacyPolicy: "Privacy Policy",
  termsConditions: "Terms & Conditions"
};

hi.Footer = {
  ...hi.Footer,
  tagline: "सिर्फ जनता के लिए",
  mainHubLabel: "मुख्य हब — विवेक विहार",
  mainHubAddress: "493/C/A, जी. टी. रोड (दक्षिण), फ़ज़ीर बाज़ार मोड़, विवेक विहार फेज़-II, दुकान नंबर 4, पी.ओ. और पी.एस. शिबपुर, जिला हावड़ा, पिन: 711101",
  openDaily: "रोजाना सुबह 8 बजे से रात 10 बजे तक खुला है",
  servicesTitle: "सेवाएं",
  quickLinksTitle: "त्वरित लिंक",
  legalTitle: "कानूनी",
  designBy: "डिज़ाइन और निर्माण",
  pharmacy: "फार्मेसी (दवाखाना)",
  pathology: "पैथोलॉजी और डायग्नोस्टिक्स",
  doctorChambers: "डॉक्टर चैंबर",
  productsOffers: "उत्पाद और ऑफर",
  storeLocations: "स्टोर के स्थान",
  ourDoctors: "हमारे डॉक्टर",
  rateChart: "मरीज़ दर सूची",
  leaveFeedback: "प्रतिक्रिया दें",
  facebookPage: "फेसबुक पेज",
  privacyPolicy: "गोपनीयता नीति",
  termsConditions: "नियम और शर्तें"
};

// 2. Add Stores keys
en.Stores = {
  vivekvihar: {
    name: "Vivek Vihar Main Hub",
    tagline: "Main Branch · Pharmacy & Pathology",
    address: "493/C/A, G. T. Road (South), Fazir Bazar More, Vivek Vihar Phase-II, Shop No. 4, P.O. & P.S. Shibpur, Dist. Howrah, Pin: 711101"
  },
  shibpur: {
    name: "Shibpur Store",
    tagline: "Pharmacy, Pathology & Doctor Chambers",
    address: "53, Kalikumar Mukharjee Lane, Tram Depot More, P.O. & P.S. Shibpur, D.T. Howrah, Pin: 711102"
  },
  pilkhana: {
    name: "Pilkhana Store",
    tagline: "Pharmacy & Pathology",
    address: "67/A, G. T. Road (North), Oriya Para More, Pilkhana, Salkia, Howrah - 711106, West Bengal"
  }
};

hi.Stores = {
  vivekvihar: {
    name: "विवेक विहार मुख्य हब",
    tagline: "मुख्य शाखा · फार्मेसी और पैथोलॉजी",
    address: "493/C/A, जी. टी. रोड (दक्षिण), फ़ज़ीर बाज़ार मोड़, विवेक विहार फेज़-II, दुकान नंबर 4, पी.ओ. और पी.एस. शिबपुर, जिला हावड़ा, पिन: 711101"
  },
  shibpur: {
    name: "शिबपुर स्टोर",
    tagline: "फार्मेसी, पैथोलॉजी और डॉक्टर चैंबर",
    address: "53, कालीकुमार मुखर्जी लेन, ट्राम डिपो मोड़, पी.ओ. और पी.एस. शिबपुर, जिला हावड़ा, पिन: 711102"
  },
  pilkhana: {
    name: "पिलखाना स्टोर",
    tagline: "फार्मेसी और पैथोलॉजी",
    address: "67/A, जी. टी. रोड (उत्तर), उड़िया पाड़ा मोड़, पिलखाना, सलकिया, हावड़ा - 711106, पश्चिम बंगाल"
  }
};

// 3. Add LocationsPage missing keys
en.LocationsPage = {
  ...en.LocationsPage,
  mainHubBadge: "Main hub",
  timeBadge: "8 AM – 10 PM",
  costBadge: "₹100/- cost only",
  perCheckup: "per checkup",
  daily: "Daily",
  services: {
    pharmacy: "Pharmacy",
    pathology: "Pathology",
    doctorChambers: "Doctor Chambers"
  }
};

hi.LocationsPage = {
  ...hi.LocationsPage,
  mainHubBadge: "मुख्य हब",
  timeBadge: "सुबह 8 से रात 10 बजे",
  costBadge: "केवल ₹100/-",
  perCheckup: "प्रति चेकअप",
  daily: "दैनिक",
  services: {
    pharmacy: "फार्मेसी",
    pathology: "पैथोलॉजी",
    doctorChambers: "डॉक्टर चैंबर"
  }
};

// 4. Add RateChartPage missing keys
en.RateChartPage = {
  ...en.RateChartPage,
  trustIndicator: "Transparent pricing — no hidden charges. Same rates across all three stores.",
  catBudget: "Budget",
  catStandard: "Standard",
  catPremium: "Premium"
};

hi.RateChartPage = {
  ...hi.RateChartPage,
  trustIndicator: "पारदर्शी मूल्य निर्धारण — कोई छिपे हुए शुल्क नहीं। तीनों स्टोर में एक ही दरें।",
  catBudget: "किफायती",
  catStandard: "सामान्य",
  catPremium: "प्रीमियम"
};

// 5. Add MedicinesPage missing keys
en.MedicinesPage = {
  ...en.MedicinesPage,
  trustIndicator: "All medicines are 100% genuine and sourced from verified pharmaceutical companies.",
  contactPharmacy: "Contact Pharmacy",
  offFormat: "{percentage}% off"
};

hi.MedicinesPage = {
  ...hi.MedicinesPage,
  trustIndicator: "सभी दवाइयां 100% असली हैं और सत्यापित दवा कंपनियों से मंगवाई गई हैं।",
  contactPharmacy: "फार्मेसी से संपर्क करें",
  offFormat: "{percentage}% छूट"
};

fs.writeFileSync(enPath, JSON.stringify(en, null, 2) + "\\n");
fs.writeFileSync(hiPath, JSON.stringify(hi, null, 2) + "\\n");

console.log("Translation files updated successfully.");
