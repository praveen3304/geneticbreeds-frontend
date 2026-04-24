import React, { useState, useEffect, useRef, useCallback } from "react";

// ─── DETECT USER REGION ───────────────────────────────────────────────────────
function detectUserInfo() {
  try {
    const user = JSON.parse(localStorage.getItem("gb_user") || "null");
    if (user) {
      const isAdmin = user.role === "admin";
      const c = (user.country || "").toLowerCase().trim();
      const countryRegion = (c === "india" || c === "in") ? "india" : "international";

      if (isAdmin) {
        // Admin: use paymentRegionOverride to determine which terms to show
        const override = (user.paymentRegionOverride || "auto").toLowerCase();
        if (override === "india") return { region: "india", isAdmin: true };
        if (override === "international") return { region: "international", isAdmin: true };
        // "auto" — fall back to their country
        return { region: countryRegion, isAdmin: true };
      }

      // Regular user: always use their country
      return { region: countryRegion, isAdmin: false };
    }
  } catch {
    // ignore
  }
  return { region: "international", isAdmin: false };
}

// ─── INDIAN DATA ──────────────────────────────────────────────────────────────
const INDIA_SECTIONS = [
  {
    id: "terms",
    icon: "⚖️",
    label: "Terms & Conditions",
    color: "#b91c1c",
    bg: "#fff1f2",
    border: "#fecdd3",
    items: [
      {
        title: "1. About Genetic Breeds",
        content: `Genetic Breeds is an online pet marketplace platform that connects pet sellers, breeders, and buyers across India and internationally. We operate solely as a classified advertisement platform — we do not breed, sell, or own any animals listed on this platform.\n\nBy accessing or using Genetic Breeds, you confirm that you have read, understood, and agree to be bound by these Terms & Conditions. These terms apply to all users including sellers, buyers, breeders, and visitors.`,
      },
      {
        title: "2. Eligibility",
        content: `To use Genetic Breeds, you must:\n• Be at least 18 years of age\n• Have the legal capacity to enter into a binding agreement under Indian law\n• Not be prohibited from using our services under applicable Indian laws\n• Provide accurate and truthful registration information\n\nBy using our platform, you represent and warrant that you meet all eligibility requirements. We reserve the right to suspend or terminate accounts that do not meet these requirements.`,
      },
      {
        title: "3. Platform Role & Liability",
        content: `Genetic Breeds acts solely as a neutral intermediary platform. We are not a party to any transaction between buyers and sellers. We do not verify the health, quality, breed accuracy, or legal status of any animal listed.\n\nGenetic Breeds holds no liability for:\n• The accuracy or truthfulness of any listing\n• The health or condition of any animal\n• Any disputes, losses, or damages arising from user transactions\n• Any fraudulent or deceptive activity by users\n• Delivery, transportation, or transfer of animals\n• Any legal violations committed by users`,
      },
      {
        title: "4. User Responsibilities",
        content: `By using Genetic Breeds, you agree to:\n• Provide accurate and truthful information in all listings\n• Comply with all applicable Indian laws and regulations\n• Hold all required licences and permits for breeding or selling animals\n• Not list, promote, or sell any banned, restricted, or illegally obtained animals\n• Not use the platform for fraudulent or unlawful purposes\n• Take full responsibility for any animal you sell or rehome\n• Ensure humane and ethical treatment of all animals at all times`,
      },
      {
        title: "5. Prohibited Listings & Animal Policy",
        content: `Genetic Breeds strictly prohibits listing, promotion, or sale of:\n• Any animal breed banned or restricted under Indian law or your state's regulations\n• Wildlife species protected under the Wildlife Protection Act, 1972\n• CITES-listed species that are internationally protected\n• Any animal obtained through poaching, illegal trapping, or wildlife trafficking\n• Any animal illegal to own, sell, or trade in India\n• Any animal subjected to inhumane treatment or illegal breeding\n\nUsers are solely responsible for verifying that their listings comply with all applicable laws. Violations will result in immediate account suspension and may be reported to relevant authorities including the Wildlife Crime Control Bureau (WCCB).`,
      },
      {
        title: "6. Licence Requirements",
        content: `Sellers are required to hold all valid licences and permits mandated by the laws of their state and region for breeding, selling, or trading animals. This may include licences from the State Animal Husbandry Department, local Municipal Authority, or registration under applicable animal welfare legislation.\n\nLicensed and verified sellers receive trust badges on their profiles. Providing false licence information is a violation of these Terms and may result in permanent account suspension.`,
      },
      {
        title: "7. Payments & Fees",
        content: `Genetic Breeds charges fees for ad posting and membership plans. All payments are processed through our secure payment gateway.\n\n• All fees are displayed in Indian Rupees (INR) for Indian users\n• Payments are non-refundable once processed, except as outlined in our Refund Policy\n• Membership credits are non-transferable and expire as per plan terms\n• We are not responsible for payment disputes between buyers and sellers for animal transactions\n• We reserve the right to modify our pricing at any time with reasonable notice`,
      },
      {
        title: "8. Content Policy",
        content: `You must not post content that:\n• Is false, misleading, or fraudulent\n• Promotes animal cruelty, abuse, or neglect\n• Violates any third-party intellectual property rights\n• Contains personal contact details in listing titles\n• Is offensive, discriminatory, or inappropriate\n• Violates any applicable Indian law\n\nWe reserve the right to remove any listing or suspend any account that violates this policy without prior notice.`,
      },
      {
        title: "9. Intellectual Property",
        content: `All content you post on Genetic Breeds, including photos and descriptions, remains your property. However, by posting content, you grant Genetic Breeds a non-exclusive, royalty-free licence to display and use that content for platform operation and promotional purposes.\n\nThe Genetic Breeds platform, logo, design, and all proprietary content are owned by Genetic Breeds and protected under applicable intellectual property laws. You may not copy, reproduce, or use our branding without prior written consent.`,
      },
      {
        title: "10. Indemnification",
        content: `You agree to indemnify and hold harmless Genetic Breeds, its directors, employees, and agents from any claims, damages, losses, liabilities, or expenses (including legal fees) arising from:\n• Your use of the platform\n• Your violation of these Terms\n• Your violation of any applicable law\n• Any animal transaction you conduct through the platform\n• Any content you post on the platform`,
      },
      {
        title: "11. Account Termination",
        content: `We reserve the right to suspend or terminate any account that:\n• Posts banned or illegal animal listings\n• Engages in fraudulent or deceptive activity\n• Repeatedly violates platform policies\n• Receives multiple verified complaints from other users\n• Provides false information during registration or listing\n\nTermination does not entitle users to any refund of fees paid.`,
      },
      {
        title: "12. Changes to Terms",
        content: `Genetic Breeds reserves the right to update or modify these Terms & Conditions at any time. We will notify users of significant changes via email or platform notification. Continued use of the platform after changes constitutes acceptance of the revised Terms.`,
      },
      {
        title: "13. Governing Law & Disputes",
        content: `These Terms & Conditions are governed by and construed in accordance with the laws of India. Any disputes arising from the use of this platform shall be subject to the exclusive jurisdiction of the competent courts in India.\n\nIn the event of a dispute, we encourage users to first contact us at geneticbreeds@gmail.com to seek an amicable resolution before pursuing legal action.`,
      },
      {
        title: "14. Exotic & Rare Animals Policy",
        content: `Genetic Breeds permits listings for legally owned exotic and rare animals subject to the following strict conditions:\n\n• Users are strictly prohibited from listing any animal that is illegal to own, sell, or trade under applicable national, state, or local wildlife protection laws\n• The sale or listing of exotic pets is strictly subject to local and national wildlife laws and regulations\n• Users are solely responsible for ensuring full legal compliance before listing or purchasing any exotic animal\n• All exotic animal listings must include proof of legal ownership, valid permits, and any required documentation as mandated by law\n• Genetic Breeds reserves the right to remove any exotic animal listing at its sole discretion without prior notice\n• Any user found listing illegally obtained exotic animals will be permanently banned and reported to relevant wildlife authorities\n\nGenetic Breeds does not endorse, facilitate, or encourage the trade of any animal in violation of applicable law. Listing exotic animals is a privilege, not a right, on our platform.`,
      },
      {
        title: "15. Platform Availability & As-Is Disclaimer",
        content: `Genetic Breeds is provided on an "as-is" and "as-available" basis without any warranties of any kind, either express or implied. We do not warrant that:\n\n• The platform will be uninterrupted, error-free, or completely secure\n• Any defects or errors will be corrected\n• The platform or its servers are free of viruses or harmful components\n• The results obtained from using the platform will be accurate or reliable\n\nTo the fullest extent permitted by applicable law, Genetic Breeds expressly disclaims all warranties, express or implied, including but not limited to implied warranties of merchantability, fitness for a particular purpose, and non-infringement. Your use of the platform is entirely at your own risk.`,
      },
      {
        title: "16. Zero Tolerance — Illegal Wildlife Trade",
        content: `Genetic Breeds maintains a strict zero-tolerance policy towards the illegal wildlife trade. We are committed to actively combating wildlife trafficking and animal cruelty.\n\n• Any listing suspected of involving illegally obtained, poached, or trafficked animals will be immediately removed\n• User accounts involved in illegal wildlife trade will be permanently suspended without notice or refund\n• All suspected cases of illegal wildlife trade will be proactively reported to relevant law enforcement and wildlife protection authorities\n• Users who knowingly purchase illegally listed animals are equally liable under applicable law\n• Genetic Breeds cooperates fully with law enforcement agencies investigating wildlife crime\n\nIf you encounter any listing that you suspect involves illegal wildlife trade, you are encouraged to report it immediately to geneticbreeds@gmail.com. Your report will be treated with strict confidentiality.`,
      },
      {
        title: "17. Legal Protection & Limitation of Liability",
        content: `To the maximum extent permitted by applicable law:\n\n• Genetic Breeds shall not be liable for any indirect, incidental, special, consequential, punitive, or exemplary damages arising from your use of or inability to use the platform\n• Our total liability to you for any claim arising from these Terms shall not exceed the amount you paid to us in the 3 months preceding the claim\n• We are not responsible for any loss or damage caused by a distributed denial-of-service attack, viruses, or other technologically harmful material\n• We are not liable for any transactions, disputes, or losses between buyers and sellers\n• We are not responsible for any animal's health, condition, breed accuracy, or legal status\n• We are not liable for any actions taken by government or regulatory authorities against users for violations of applicable law\n\nSome jurisdictions do not allow the exclusion or limitation of liability for consequential or incidental damages, so the above limitations may not apply to you in full.`,
      },
      {
        title: "18. Severability & Waiver",
        content: `If any provision of these Terms & Conditions is found to be invalid, illegal, or unenforceable by a court of competent jurisdiction, that provision shall be modified to the minimum extent necessary to make it enforceable, and the remaining provisions shall continue in full force and effect.\n\nOur failure to enforce any right or provision of these Terms shall not be considered a waiver of those rights. Any waiver of any provision of these Terms will be effective only if in writing and signed by an authorised representative of Genetic Breeds.`,
      },
      {
        title: "19. Third-Party Links & Services",
        content: `Our platform may contain links to third-party websites, services, or resources. Genetic Breeds is not responsible for:\n\n• The content, accuracy, or practices of any third-party websites\n• Any damages or losses caused by your use of third-party services\n• The privacy practices of third-party websites\n\nWe encourage you to review the terms and privacy policies of any third-party services you access through our platform. The inclusion of any link does not imply our endorsement of the linked site or service.`,
      },
      {
        title: "20. Entire Agreement & User Acknowledgement",
        content: `These Terms & Conditions, together with our Privacy Policy, Disclaimer, and Refund Policy, constitute the entire agreement between you and Genetic Breeds with respect to your use of the platform and supersede all prior agreements and understandings.\n\nBy using Genetic Breeds, you expressly acknowledge and agree that:\n• You have read, understood, and accepted these Terms in full\n• You are at least 18 years of age\n• You will comply with all applicable laws in your jurisdiction\n• You take full legal responsibility for all listings and transactions you conduct on the platform\n• You understand that Genetic Breeds is a classified advertisement platform only and is not a party to any transaction`,
      },
      {
        title: "21. Contact",
        content: `For questions about these Terms & Conditions, please contact us at:\n\nEmail: geneticbreeds@gmail.com\n\nWe aim to respond to all enquiries within 3–5 business days.`,
      },
    ],
  },
  {
    id: "privacy",
    icon: "🔒",
    label: "Privacy Policy",
    color: "#1d4ed8",
    bg: "#eff6ff",
    border: "#bfdbfe",
    items: [
      {
        title: "1. Introduction",
        content: `Genetic Breeds is committed to protecting your privacy and personal data. This Privacy Policy explains how we collect, use, store, and protect your personal information when you use our platform.\n\nThis policy complies with the Digital Personal Data Protection Act, 2023 (DPDPA) of India. By using our platform, you consent to the collection and use of your information as described in this policy.`,
      },
      {
        title: "2. Information We Collect",
        content: `We collect the following types of information:\n• Account Information: Name, email address, phone number, country, state, city\n• Listing Information: Pet details, photos, price, and location details you provide\n• Payment Information: Transaction IDs and payment status (we do not store card or bank details)\n• Communication Data: Messages sent through our platform chat system\n• Usage Data: Pages visited, features used, device type, and browser information\n• Licence Documents: If you voluntarily upload a breeder or pet shop licence for verification`,
      },
      {
        title: "3. How We Use Your Information",
        content: `We use your information to:\n• Create and manage your account\n• Display your listings to potential buyers\n• Process payments for ad posting and membership plans\n• Send important notifications about your account or listings\n• Verify seller licences and display trust badges\n• Prevent fraud, abuse, and illegal activity on the platform\n• Improve our platform and user experience\n• Comply with legal obligations under Indian law`,
      },
      {
        title: "4. Data Sharing",
        content: `We do not sell your personal data to third parties. We may share your data only with:\n• Authorised payment processors for transaction processing\n• Cloud service providers for secure data storage and delivery\n• Law enforcement or government authorities if required by Indian law or court order\n• Relevant authorities in cases of suspected illegal wildlife trade or animal cruelty\n\nAll third-party service providers are contractually obligated to protect your data.`,
      },
      {
        title: "5. Data Storage & Security",
        content: `Your personal data is stored on secure, encrypted cloud servers. We implement industry-standard security measures including:\n• Encrypted data transmission using secure protocols\n• Secure authentication mechanisms\n• Encrypted password storage\n• Regular security monitoring and audits\n• Access controls limiting who can view your data\n\nWhile we take all reasonable precautions, no system is completely immune to security risks. We cannot guarantee absolute security and encourage you to use strong passwords and protect your account credentials.`,
      },
      {
        title: "6. Your Rights",
        content: `Under the Digital Personal Data Protection Act, 2023, you have the right to:\n• Access the personal data we hold about you\n• Request correction of inaccurate or incomplete data\n• Request deletion of your account and associated data\n• Withdraw consent for data processing\n• Nominate a person to exercise your rights in case of death or incapacity\n\nTo exercise any of these rights, contact us at: geneticbreeds@gmail.com`,
      },
      {
        title: "7. Cookies & Local Storage",
        content: `We use session tokens and local storage to keep you securely logged in and to improve your experience on our platform. We do not use third-party advertising cookies or tracking technologies that share your data with advertisers.`,
      },
      {
        title: "8. Children's Privacy",
        content: `Our platform is not intended for users under 18 years of age. We do not knowingly collect personal information from minors. If we become aware that a minor has provided personal data, we will delete it promptly. Parents or guardians who believe their child has provided data to us should contact us immediately.`,
      },
      {
        title: "9. Changes to This Policy",
        content: `We may update this Privacy Policy from time to time. We will notify users of significant changes via email or platform notification. Continued use of the platform after changes constitutes acceptance of the revised policy.`,
      },
    ],
  },
  {
    id: "disclaimer",
    icon: "⚠️",
    label: "Disclaimer",
    color: "#92400e",
    bg: "#fffbeb",
    border: "#fde68a",
    items: [
      {
        title: "1. Platform Disclaimer",
        content: `Genetic Breeds is an online classified advertisement platform. We act solely as an intermediary between sellers and buyers. We do not own, breed, trade, or physically handle any animals listed on our platform.\n\nWe are not responsible for the accuracy, completeness, or legality of any listing posted by users. The presence of any listing on our platform does not imply our endorsement, approval, or verification of the seller, the animal, or the transaction.`,
      },
      {
        title: "2. Animal Welfare & Legal Compliance",
        content: `All users of Genetic Breeds must comply with applicable animal welfare and protection laws in India. This includes but is not limited to:\n• Prevention of Cruelty to Animals Act, 1960\n• Wildlife Protection Act, 1972\n• Dog Breeding & Marketing Rules, 2017\n• State-specific animal welfare and breeding regulations\n• Local Municipal Corporation rules for pet shops\n\nUsers are solely responsible for ensuring their listings and transactions comply with all applicable laws.`,
      },
      {
        title: "3. Banned & Restricted Animals",
        content: `Users must not list any animal breed or species that is banned, restricted, or prohibited under Indian law or their state's regulations. It is the user's sole responsibility to verify whether an animal is legally permitted to be sold or owned in their jurisdiction before listing it on our platform.\n\nGenetic Breeds does not provide legal advice on which animals are permitted or prohibited. Users must independently verify all applicable regulations before listing any animal.`,
      },
      {
        title: "4. Protected Wildlife",
        content: `Trading in protected wildlife is a serious criminal offence under the Wildlife Protection Act, 1972 (India) and CITES (Convention on International Trade in Endangered Species). Offenders can face severe penalties including up to 7 years imprisonment and heavy fines.\n\nGenetic Breeds strictly prohibits any listing involving protected or endangered species. We actively report all suspected illegal wildlife trade to the Wildlife Crime Control Bureau (WCCB) and other relevant authorities.\n\nIf you suspect any listing on our platform involves illegal wildlife trade, please report it immediately to geneticbreeds@gmail.com or directly to WCCB at wccb.gov.in.`,
      },
      {
        title: "5. No Endorsement",
        content: `Genetic Breeds does not endorse any seller, buyer, or listing on the platform. We do not verify the health, breed accuracy, vaccination status, or legal status of any animal listed. Users must conduct their own due diligence before entering into any transaction.\n\nWe strongly recommend that buyers:\n• Request complete health and vaccination records\n• Verify the seller's licence and credentials\n• Inspect the animal in person before purchase where possible\n• Use secure payment methods`,
      },
      {
        title: "6. Reporting Illegal Listings",
        content: `If you suspect any listing violates wildlife protection laws, promotes banned animals, or involves animal cruelty, please report it immediately to:\n\nEmail: geneticbreeds@gmail.com\n\nYou may also report wildlife crime directly to the Wildlife Crime Control Bureau (WCCB) at wccb.gov.in or contact your local animal welfare authority.`,
      },
      {
        title: "7. Limitation of Liability",
        content: `To the maximum extent permitted by applicable law, Genetic Breeds shall not be liable for any direct, indirect, incidental, consequential, or punitive damages arising from:\n• Use of or inability to use the platform\n• Any transaction conducted through the platform\n• Any illegal activity by users\n• The health, condition, or quality of any animal purchased\n• Any loss of data or business interruption`,
      },
      {
        title: "8. Force Majeure",
        content: `Genetic Breeds shall not be held liable for any failure or delay in performance resulting from causes beyond our reasonable control, including but not limited to natural disasters, government actions, internet outages, cyberattacks, or other unforeseen events.`,
      },
      {
        title: "9. Exotic Pets — Special Disclaimer",
        content: `The sale or listing of exotic pets on Genetic Breeds is strictly subject to local, state, and national wildlife laws and regulations. Users are solely responsible for ensuring full legal compliance before listing or purchasing any exotic animal.\n\n• Users are strictly prohibited from listing any animal that is illegal to own, sell, or trade under applicable wildlife protection laws\n• Genetic Breeds does not verify whether any exotic animal listed is legally owned or permitted\n• We are not responsible for any legal consequences arising from the listing or purchase of exotic animals\n• Buyers are strongly advised to verify the legal status of any exotic animal and request all relevant permits and documentation before completing any transaction\n\nGenetic Breeds reserves the right to remove any exotic animal listing at any time without prior notice or liability.`,
      },
      {
        title: "10. User-Generated Content Disclaimer",
        content: `All listings, descriptions, photos, and information on Genetic Breeds are user-generated content. Genetic Breeds does not verify, endorse, or take responsibility for any user-generated content.\n\n• We are not responsible for the accuracy, truthfulness, or legality of any listing\n• Photos may not accurately represent the actual animal\n• Prices and availability are subject to change without notice\n• Genetic Breeds reserves the right to remove any content that violates our policies at our sole discretion`,
      },
    ],
  },
  {
    id: "refund",
    icon: "💳",
    label: "Refund Policy",
    color: "#065f46",
    bg: "#ecfdf5",
    border: "#a7f3d0",
    items: [
      {
        title: "1. Overview",
        content: `This Refund Policy applies to all payments made on Genetic Breeds for ad posting fees and membership plans. Please read this policy carefully before making any payment on our platform.\n\nAll payments on Genetic Breeds are processed through our secure payment gateway. By making a payment, you acknowledge and agree to the terms of this Refund Policy.`,
      },
      {
        title: "2. Ad Posting Fees",
        content: `• Ad posting fees are non-refundable once the ad has been published\n• If your ad is rejected due to policy violations (banned animals, illegal content), no refund will be issued\n• If payment was successfully deducted but the ad was not published due to a verified technical error on our side, a full refund will be processed within 5–7 business days`,
      },
      {
        title: "3. Membership Plans",
        content: `• Membership plan payments are non-refundable once activated\n• Unused ad credits or boost credits within a plan cannot be refunded or transferred\n• Membership plans expire as per the plan duration and cannot be extended or refunded upon expiry\n• If payment was deducted but membership was not activated due to a verified technical error on our side, a full refund will be processed within 5–7 business days`,
      },
      {
        title: "4. Animal Purchase Transactions",
        content: `Genetic Breeds is a classified advertisement platform only. We are not involved in direct animal purchase transactions between buyers and sellers. Therefore:\n• We do not process refunds for animal purchases\n• Any disputes regarding animal quality, health, or delivery must be resolved directly between the buyer and seller\n• Genetic Breeds holds no responsibility for such transactions\n\nWe strongly recommend buyers verify all details and inspect animals before completing any transaction.`,
      },
      {
        title: "5. Eligible Refund Cases",
        content: `Refunds will only be considered in the following cases:\n• Double payment charged due to a verified technical error\n• Payment successfully deducted but service not delivered due to our system error\n• Unauthorised transaction reported to us within 24 hours of occurrence\n\nAll refund requests are subject to investigation and verification by our team.`,
      },
      {
        title: "6. How to Request a Refund",
        content: `To request a refund, email us at geneticbreeds@gmail.com with the following details:\n• Your registered email address\n• Payment transaction ID\n• Date and amount of payment\n• Clear description of the reason for refund request\n\nWe will review your request and respond within 3–5 business days.`,
      },
      {
        title: "7. Refund Processing Time",
        content: `Approved refunds will be processed within 5–7 business days to your original payment method. Processing times may vary depending on your bank or payment provider. We are not responsible for delays caused by your bank or payment provider.\n\nAll approved refunds will be issued in Indian Rupees (INR) to the original payment source.`,
      },
      {
        title: "8. Changes to This Policy",
        content: `Genetic Breeds reserves the right to update or modify this Refund Policy at any time. We will notify users of significant changes via email or platform notification. Continued use of the platform after changes constitutes acceptance of the revised policy.`,
      },
    ],
  },
];

// ─── INTERNATIONAL DATA ───────────────────────────────────────────────────────
const INTERNATIONAL_SECTIONS = [
  {
    id: "terms",
    icon: "⚖️",
    label: "Terms & Conditions",
    color: "#b91c1c",
    bg: "#fff1f2",
    border: "#fecdd3",
    items: [
      {
        title: "1. About Genetic Breeds",
        content: `Genetic Breeds is an international online pet marketplace platform that connects pet sellers, breeders, and buyers worldwide. We operate solely as a classified advertisement platform — we do not breed, sell, or own any animals listed on this platform.\n\nBy accessing or using Genetic Breeds, you confirm that you have read, understood, and agree to be bound by these Terms & Conditions. These terms apply to all users including sellers, buyers, breeders, and visitors, regardless of your country of residence.`,
      },
      {
        title: "2. Eligibility",
        content: `To use Genetic Breeds, you must:\n• Be at least 18 years of age or the legal age of majority in your country\n• Have the legal capacity to enter into a binding agreement under the laws of your country\n• Not be prohibited from using our services under applicable laws\n• Provide accurate and truthful registration information\n\nBy using our platform, you represent and warrant that you meet all eligibility requirements. We reserve the right to suspend or terminate accounts that do not meet these requirements.`,
      },
      {
        title: "3. Platform Role & Liability",
        content: `Genetic Breeds acts solely as a neutral intermediary platform connecting buyers and sellers globally. We are not a party to any transaction between users. We do not verify the health, quality, breed accuracy, or legal status of any animal listed.\n\nGenetic Breeds holds no liability for:\n• The accuracy or truthfulness of any listing\n• The health or condition of any animal\n• Any disputes, losses, or damages arising from user transactions\n• Any fraudulent or deceptive activity by users\n• Delivery, transportation, or international transfer of animals\n• Any legal violations committed by users in their respective countries`,
      },
      {
        title: "4. User Responsibilities",
        content: `By using Genetic Breeds, you agree to:\n• Provide accurate and truthful information in all listings and communications\n• Comply with all applicable local, national, and international laws and regulations in your country\n• Hold all required licences, permits, and authorisations required by your country or region\n• Not list, promote, or sell any banned, restricted, protected, or illegally obtained animals\n• Not use the platform for fraudulent, deceptive, or unlawful purposes\n• Take full responsibility for any animal you sell, rehome, or transfer\n• Ensure humane and ethical treatment of all animals at all times`,
      },
      {
        title: "5. Prohibited Listings & Animal Policy",
        content: `Genetic Breeds strictly prohibits the listing, promotion, or sale of:\n• Any animal breed that is banned or restricted under the laws of your country, state, or region\n• Any wildlife species protected under national or international law, including species listed under CITES (Convention on International Trade in Endangered Species)\n• Any animal obtained through poaching, illegal trapping, wildlife trafficking, or any unlawful means\n• Any animal that is illegal to own, sell, or trade in the seller's or buyer's country\n• Any animal subjected to inhumane treatment, illegal breeding practices, or cruelty\n\nUsers are solely responsible for verifying that their listings comply with all applicable laws in their jurisdiction. Violations will result in immediate account suspension and may be reported to relevant national and international authorities.`,
      },
      {
        title: "6. Licence & Permit Requirements",
        content: `Sellers are required to hold all valid licences, permits, and registrations mandated by the laws of their country and region for breeding, selling, or trading animals.\n\nLicensed and verified sellers receive trust badges on their profiles. Providing false licence or permit information is a serious violation of these Terms and may result in permanent account suspension and reporting to relevant authorities.`,
      },
      {
        title: "7. Payments & Fees",
        content: `Genetic Breeds charges fees for ad posting and membership plans. All payments are processed through our secure payment gateway.\n\n• Fees are displayed in your local currency where supported\n• Payments are non-refundable once processed, except as outlined in our Refund Policy\n• Membership credits are non-transferable and expire as per plan terms\n• We are not responsible for payment disputes between buyers and sellers for animal transactions\n• We reserve the right to modify our pricing at any time with reasonable notice`,
      },
      {
        title: "8. Content Policy",
        content: `You must not post content that:\n• Is false, misleading, or fraudulent\n• Promotes animal cruelty, abuse, or neglect\n• Violates any third-party intellectual property rights\n• Contains personal contact details in listing titles\n• Is offensive, discriminatory, or inappropriate\n• Violates any applicable law in your country\n\nWe reserve the right to remove any listing or suspend any account that violates this policy without prior notice.`,
      },
      {
        title: "9. Intellectual Property",
        content: `All content you post on Genetic Breeds, including photos and descriptions, remains your property. However, by posting content, you grant Genetic Breeds a non-exclusive, royalty-free licence to display and use that content for platform operation and promotional purposes.\n\nThe Genetic Breeds platform, logo, design, and all proprietary content are owned by Genetic Breeds and protected under applicable intellectual property laws. You may not copy, reproduce, or use our branding without prior written consent.`,
      },
      {
        title: "10. Indemnification",
        content: `You agree to indemnify and hold harmless Genetic Breeds, its directors, employees, and agents from any claims, damages, losses, liabilities, or expenses (including legal fees) arising from:\n• Your use of the platform\n• Your violation of these Terms\n• Your violation of any applicable law in your country\n• Any animal transaction you conduct through the platform\n• Any content you post on the platform`,
      },
      {
        title: "11. Account Termination",
        content: `We reserve the right to suspend or terminate any account that:\n• Posts banned or illegal animal listings\n• Engages in fraudulent or deceptive activity\n• Repeatedly violates platform policies\n• Receives multiple verified complaints from other users\n• Provides false information during registration or listing\n\nTermination does not entitle users to any refund of fees paid.`,
      },
      {
        title: "12. Changes to Terms",
        content: `Genetic Breeds reserves the right to update or modify these Terms & Conditions at any time. We will notify users of significant changes via email or platform notification. Continued use of the platform after changes constitutes acceptance of the revised Terms.`,
      },
      {
        title: "13. Governing Law & Disputes",
        content: `These Terms & Conditions are governed by applicable law. Users are responsible for complying with the laws of their own country when using this platform.\n\nIn the event of a dispute, we encourage users to first contact us at geneticbreeds@gmail.com to seek an amicable resolution. If a resolution cannot be reached, disputes may be referred to binding arbitration or the appropriate legal jurisdiction as agreed upon by both parties.`,
      },
      {
        title: "14. Exotic & Rare Animals Policy",
        content: `Genetic Breeds permits listings for legally owned exotic and rare animals subject to the following strict conditions:\n\n• Users are strictly prohibited from listing any animal that is illegal to own, sell, or trade under applicable national, state, or local wildlife protection laws\n• The sale or listing of exotic pets is strictly subject to local, national, and international wildlife laws and regulations including CITES\n• Users are solely responsible for ensuring full legal compliance before listing or purchasing any exotic animal\n• All exotic animal listings must include proof of legal ownership, valid permits, and any required documentation as mandated by law in your country\n• Genetic Breeds reserves the right to remove any exotic animal listing at its sole discretion without prior notice\n• Any user found listing illegally obtained exotic animals will be permanently banned and reported to relevant wildlife authorities\n\nGenetic Breeds does not endorse, facilitate, or encourage the trade of any animal in violation of applicable law. Listing exotic animals is a privilege, not a right, on our platform.`,
      },
      {
        title: "15. Platform Availability & As-Is Disclaimer",
        content: `Genetic Breeds is provided on an "as-is" and "as-available" basis without any warranties of any kind, either express or implied. We do not warrant that:\n\n• The platform will be uninterrupted, error-free, or completely secure\n• Any defects or errors will be corrected\n• The platform or its servers are free of viruses or harmful components\n• The results obtained from using the platform will be accurate or reliable\n\nTo the fullest extent permitted by applicable law, Genetic Breeds expressly disclaims all warranties, express or implied, including but not limited to implied warranties of merchantability, fitness for a particular purpose, and non-infringement. Your use of the platform is entirely at your own risk.`,
      },
      {
        title: "16. Zero Tolerance — Illegal Wildlife Trade",
        content: `Genetic Breeds maintains a strict zero-tolerance policy towards the illegal wildlife trade. We are committed to actively combating wildlife trafficking and animal cruelty.\n\n• Any listing suspected of involving illegally obtained, poached, or trafficked animals will be immediately removed\n• User accounts involved in illegal wildlife trade will be permanently suspended without notice or refund\n• All suspected cases of illegal wildlife trade will be proactively reported to relevant national and international law enforcement and wildlife protection authorities\n• Users who knowingly purchase illegally listed animals are equally liable under applicable law\n• Genetic Breeds cooperates fully with law enforcement agencies and international bodies investigating wildlife crime\n\nIf you encounter any listing that you suspect involves illegal wildlife trade, you are encouraged to report it immediately to geneticbreeds@gmail.com. Your report will be treated with strict confidentiality.`,
      },
      {
        title: "17. Legal Protection & Limitation of Liability",
        content: `To the maximum extent permitted by applicable law:\n\n• Genetic Breeds shall not be liable for any indirect, incidental, special, consequential, punitive, or exemplary damages arising from your use of or inability to use the platform\n• Our total liability to you for any claim arising from these Terms shall not exceed the amount you paid to us in the 3 months preceding the claim\n• We are not responsible for any loss or damage caused by a distributed denial-of-service attack, viruses, or other technologically harmful material\n• We are not liable for any transactions, disputes, or losses between buyers and sellers\n• We are not responsible for any animal's health, condition, breed accuracy, or legal status\n• We are not liable for any actions taken by government or regulatory authorities against users for violations of applicable law in their country\n\nSome jurisdictions do not allow the exclusion or limitation of liability for consequential or incidental damages, so the above limitations may not apply to you in full.`,
      },
      {
        title: "18. Severability & Waiver",
        content: `If any provision of these Terms & Conditions is found to be invalid, illegal, or unenforceable by a court of competent jurisdiction, that provision shall be modified to the minimum extent necessary to make it enforceable, and the remaining provisions shall continue in full force and effect.\n\nOur failure to enforce any right or provision of these Terms shall not be considered a waiver of those rights. Any waiver of any provision of these Terms will be effective only if in writing and signed by an authorised representative of Genetic Breeds.`,
      },
      {
        title: "19. Third-Party Links & Services",
        content: `Our platform may contain links to third-party websites, services, or resources. Genetic Breeds is not responsible for:\n\n• The content, accuracy, or practices of any third-party websites\n• Any damages or losses caused by your use of third-party services\n• The privacy practices of third-party websites\n\nWe encourage you to review the terms and privacy policies of any third-party services you access through our platform. The inclusion of any link does not imply our endorsement of the linked site or service.`,
      },
      {
        title: "20. Entire Agreement & User Acknowledgement",
        content: `These Terms & Conditions, together with our Privacy Policy, Disclaimer, and Refund Policy, constitute the entire agreement between you and Genetic Breeds with respect to your use of the platform and supersede all prior agreements and understandings.\n\nBy using Genetic Breeds, you expressly acknowledge and agree that:\n• You have read, understood, and accepted these Terms in full\n• You are at least 18 years of age or the legal age of majority in your country\n• You will comply with all applicable laws in your jurisdiction\n• You take full legal responsibility for all listings and transactions you conduct on the platform\n• You understand that Genetic Breeds is a classified advertisement platform only and is not a party to any transaction`,
      },
      {
        title: "21. Contact",
        content: `For questions about these Terms & Conditions, please contact us at:\n\nEmail: geneticbreeds@gmail.com\n\nWe aim to respond to all enquiries within 3–5 business days.`,
      },
    ],
  },
  {
    id: "privacy",
    icon: "🔒",
    label: "Privacy Policy",
    color: "#1d4ed8",
    bg: "#eff6ff",
    border: "#bfdbfe",
    items: [
      {
        title: "1. Introduction",
        content: `Genetic Breeds is committed to protecting your privacy and personal data. This Privacy Policy explains how we collect, use, store, and protect your personal information when you use our platform.\n\nThis policy is designed to comply with internationally recognised privacy standards including the General Data Protection Regulation (GDPR) for users in the European Union and other applicable data protection laws worldwide. By using our platform, you consent to the collection and use of your information as described in this policy.`,
      },
      {
        title: "2. Information We Collect",
        content: `We collect the following types of information:\n• Account Information: Name, email address, phone number, country, state, city\n• Listing Information: Pet details, photos, price, and location details you provide\n• Payment Information: Transaction IDs and payment status (we do not store card or bank details)\n• Communication Data: Messages sent through our platform chat system\n• Usage Data: Pages visited, features used, device type, and browser information\n• Licence Documents: If you voluntarily upload a breeder or pet shop licence for verification`,
      },
      {
        title: "3. How We Use Your Information",
        content: `We use your information to:\n• Create and manage your account\n• Display your listings to potential buyers\n• Process payments for ad posting and membership plans\n• Send important notifications about your account or listings\n• Verify seller licences and display trust badges\n• Prevent fraud, abuse, and illegal activity on the platform\n• Improve our platform and user experience\n• Comply with legal obligations under applicable law`,
      },
      {
        title: "4. Data Sharing",
        content: `We do not sell your personal data to third parties. We may share your data only with:\n• Authorised payment processors for transaction processing\n• Cloud service providers for secure data storage and delivery\n• Law enforcement or government authorities if required by applicable law or court order\n• Relevant authorities in cases of suspected illegal wildlife trade or animal cruelty\n\nAll third-party service providers are contractually obligated to protect your data in accordance with applicable privacy laws.`,
      },
      {
        title: "5. Data Storage & Security",
        content: `Your personal data is stored on secure, encrypted cloud servers. We implement industry-standard security measures including:\n• Encrypted data transmission using secure protocols\n• Secure authentication mechanisms\n• Encrypted password storage\n• Regular security monitoring and audits\n• Strict access controls limiting who can view your data\n\nWhile we take all reasonable precautions, no system is completely immune to security risks. We cannot guarantee absolute security and encourage you to use strong passwords and protect your account credentials.`,
      },
      {
        title: "6. Your Rights",
        content: `Depending on your country of residence, you may have the following rights regarding your personal data:\n• Right to access the personal data we hold about you\n• Right to correction of inaccurate or incomplete data\n• Right to deletion of your account and associated data\n• Right to withdraw consent for data processing\n• Right to data portability (where applicable)\n• Right to object to processing (where applicable)\n\nTo exercise any of these rights, contact us at: geneticbreeds@gmail.com\n\nEU users may also lodge a complaint with their local data protection authority.`,
      },
      {
        title: "7. Cookies & Local Storage",
        content: `We use session tokens and local storage to keep you securely logged in and to improve your experience on our platform. We do not use third-party advertising cookies or tracking technologies that share your data with advertisers.\n\nYou may disable cookies in your browser settings, but this may affect your ability to use certain features of our platform.`,
      },
      {
        title: "8. International Data Transfers",
        content: `As an international platform, your data may be stored and processed in countries other than your own. We ensure that any international transfer of personal data is carried out in compliance with applicable data protection laws and with appropriate safeguards in place to protect your data.`,
      },
      {
        title: "9. Children's Privacy",
        content: `Our platform is not intended for users under 18 years of age. We do not knowingly collect personal information from minors. If we become aware that a minor has provided personal data, we will delete it promptly. Parents or guardians who believe their child has provided data to us should contact us immediately.`,
      },
      {
        title: "10. Changes to This Policy",
        content: `We may update this Privacy Policy from time to time. We will notify users of significant changes via email or platform notification. Continued use of the platform after changes constitutes acceptance of the revised policy.`,
      },
    ],
  },
  {
    id: "disclaimer",
    icon: "⚠️",
    label: "Disclaimer",
    color: "#92400e",
    bg: "#fffbeb",
    border: "#fde68a",
    items: [
      {
        title: "1. Platform Disclaimer",
        content: `Genetic Breeds is an online classified advertisement platform. We act solely as an intermediary between sellers and buyers. We do not own, breed, trade, or physically handle any animals listed on our platform.\n\nWe are not responsible for the accuracy, completeness, or legality of any listing posted by users. The presence of any listing on our platform does not imply our endorsement, approval, or verification of the seller, the animal, or the transaction.`,
      },
      {
        title: "2. Animal Welfare & Legal Compliance",
        content: `All users of Genetic Breeds must comply with all applicable animal welfare, protection, and trade laws in their country and region. This includes national animal welfare legislation, local breeding and pet trade regulations, and international conventions such as CITES (Convention on International Trade in Endangered Species).\n\nUsers are solely responsible for ensuring their listings and transactions comply with all applicable laws in their jurisdiction. Genetic Breeds does not provide legal advice on animal laws or regulations.`,
      },
      {
        title: "3. Banned & Restricted Animals",
        content: `Users must not list any animal breed or species that is banned, restricted, or prohibited under the laws of their country, state, or region. It is the user's sole responsibility to verify whether an animal is legally permitted to be sold or owned in their jurisdiction before listing it on our platform.\n\nGenetic Breeds does not maintain a comprehensive list of banned animals for every country. Users must independently verify all applicable regulations in their location before listing any animal.`,
      },
      {
        title: "4. Protected Wildlife",
        content: `Trading in protected wildlife is a serious criminal offence under national laws and international conventions including CITES (Convention on International Trade in Endangered Species). Offenders can face severe penalties including imprisonment and heavy fines under the laws of their country.\n\nGenetic Breeds strictly prohibits any listing involving protected or endangered species. We actively cooperate with national and international wildlife authorities and report all suspected illegal wildlife trade.\n\nIf you suspect any listing on our platform involves illegal wildlife trade, please report it immediately to geneticbreeds@gmail.com.`,
      },
      {
        title: "5. No Endorsement",
        content: `Genetic Breeds does not endorse any seller, buyer, or listing on the platform. We do not verify the health, breed accuracy, vaccination status, or legal status of any animal listed. Users must conduct their own due diligence before entering into any transaction.\n\nWe strongly recommend that buyers:\n• Request complete health and vaccination records\n• Verify the seller's licence and credentials\n• Inspect the animal in person before purchase where possible\n• Use secure payment methods`,
      },
      {
        title: "6. Reporting Illegal Listings",
        content: `If you suspect any listing violates wildlife protection laws, promotes banned animals, or involves animal cruelty, please report it immediately to:\n\nEmail: geneticbreeds@gmail.com\n\nYou may also report wildlife crime to your national wildlife or animal welfare authority.`,
      },
      {
        title: "7. Limitation of Liability",
        content: `To the maximum extent permitted by applicable law, Genetic Breeds shall not be liable for any direct, indirect, incidental, consequential, or punitive damages arising from:\n• Use of or inability to use the platform\n• Any transaction conducted through the platform\n• Any illegal activity by users in their respective countries\n• The health, condition, or quality of any animal purchased\n• Any loss of data or business interruption`,
      },
      {
        title: "8. Force Majeure",
        content: `Genetic Breeds shall not be held liable for any failure or delay in performance resulting from causes beyond our reasonable control, including but not limited to natural disasters, government actions, internet outages, cyberattacks, or other unforeseen events.`,
      },
      {
        title: "9. Exotic Pets — Special Disclaimer",
        content: `The sale or listing of exotic pets on Genetic Breeds is strictly subject to local, national, and international wildlife laws and regulations including CITES. Users are solely responsible for ensuring full legal compliance before listing or purchasing any exotic animal.\n\n• Users are strictly prohibited from listing any animal that is illegal to own, sell, or trade under applicable wildlife protection laws in their country\n• Genetic Breeds does not verify whether any exotic animal listed is legally owned or permitted\n• We are not responsible for any legal consequences arising from the listing or purchase of exotic animals\n• Buyers are strongly advised to verify the legal status of any exotic animal and request all relevant permits and documentation before completing any transaction\n\nGenetic Breeds reserves the right to remove any exotic animal listing at any time without prior notice or liability.`,
      },
      {
        title: "10. User-Generated Content Disclaimer",
        content: `All listings, descriptions, photos, and information on Genetic Breeds are user-generated content. Genetic Breeds does not verify, endorse, or take responsibility for any user-generated content.\n\n• We are not responsible for the accuracy, truthfulness, or legality of any listing\n• Photos may not accurately represent the actual animal\n• Prices and availability are subject to change without notice\n• Genetic Breeds reserves the right to remove any content that violates our policies at our sole discretion`,
      },
    ],
  },
  {
    id: "refund",
    icon: "💳",
    label: "Refund Policy",
    color: "#065f46",
    bg: "#ecfdf5",
    border: "#a7f3d0",
    items: [
      {
        title: "1. Overview",
        content: `This Refund Policy applies to all payments made on Genetic Breeds for ad posting fees and membership plans. Please read this policy carefully before making any payment on our platform.\n\nAll payments on Genetic Breeds are processed through our secure payment gateway. By making a payment, you acknowledge and agree to the terms of this Refund Policy.`,
      },
      {
        title: "2. Ad Posting Fees",
        content: `• Ad posting fees are non-refundable once the ad has been published\n• If your ad is rejected due to policy violations (banned animals, illegal content), no refund will be issued\n• If payment was successfully deducted but the ad was not published due to a verified technical error on our side, a full refund will be processed within 5–7 business days`,
      },
      {
        title: "3. Membership Plans",
        content: `• Membership plan payments are non-refundable once activated\n• Unused ad credits or boost credits within a plan cannot be refunded or transferred\n• Membership plans expire as per the plan duration and cannot be extended or refunded upon expiry\n• If payment was deducted but membership was not activated due to a verified technical error on our side, a full refund will be processed within 5–7 business days`,
      },
      {
        title: "4. Animal Purchase Transactions",
        content: `Genetic Breeds is a classified advertisement platform only. We are not involved in direct animal purchase transactions between buyers and sellers. Therefore:\n• We do not process refunds for animal purchases\n• Any disputes regarding animal quality, health, or delivery must be resolved directly between the buyer and seller\n• Genetic Breeds holds no responsibility for such transactions\n\nWe strongly recommend buyers verify all details and inspect animals before completing any transaction.`,
      },
      {
        title: "5. Eligible Refund Cases",
        content: `Refunds will only be considered in the following cases:\n• Double payment charged due to a verified technical error\n• Payment successfully deducted but service not delivered due to our system error\n• Unauthorised transaction reported to us within 24 hours of occurrence\n\nAll refund requests are subject to investigation and verification by our team.`,
      },
      {
        title: "6. How to Request a Refund",
        content: `To request a refund, email us at geneticbreeds@gmail.com with the following details:\n• Your registered email address\n• Payment transaction ID\n• Date and amount of payment\n• Clear description of the reason for refund request\n\nWe will review your request and respond within 3–5 business days.`,
      },
      {
        title: "7. Refund Processing Time",
        content: `Approved refunds will be processed within 5–7 business days to your original payment method. Processing times may vary depending on your bank or payment provider. We are not responsible for delays caused by your bank or payment provider.`,
      },
      {
        title: "8. Changes to This Policy",
        content: `Genetic Breeds reserves the right to update or modify this Refund Policy at any time. We will notify users of significant changes via email or platform notification. Continued use of the platform after changes constitutes acceptance of the revised policy.`,
      },
    ],
  },
];

// ─── COMPONENT ────────────────────────────────────────────────────────────────
export default function LegalPage() {
  const [region, setRegion] = useState("international");
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState("terms");
  const [openItems, setOpenItems] = useState({});
  const [scrolled, setScrolled] = useState(false);
  const contentRef = useRef(null);

  useEffect(() => {
    const { region: detectedRegion, isAdmin: detectedAdmin } = detectUserInfo();
    setRegion(detectedRegion);
    setIsAdmin(detectedAdmin);
  }, []);

  const LEGAL_SECTIONS = region === "india" ? INDIA_SECTIONS : INTERNATIONAL_SECTIONS;

  useEffect(() => {
    const section = LEGAL_SECTIONS.find((s) => s.id === activeTab);
    if (section && section.items.length > 0) {
      setOpenItems({ [`${activeTab}-0`]: true });
    }
  }, [activeTab, region]);

  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (hash && LEGAL_SECTIONS.find((s) => s.id === hash)) {
      setActiveTab(hash);
    }
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const toggleItem = useCallback((key) => {
    setOpenItems((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const activeSection = LEGAL_SECTIONS.find((s) => s.id === activeTab);


  return (
    <div style={pageStyle}>
      {/* ── Hero ── */}
      <div style={heroStyle}>
        <div style={heroInnerStyle}>
          <div style={heroBadgeStyle}>📋 LEGAL CENTER</div>
          <h1 style={heroTitleStyle}>Legal Information</h1>
          <p style={heroSubStyle}>
            Everything you need to know about using Genetic Breeds safely and legally.
          </p>
          <p style={heroUpdatedStyle}>Last updated: April 2026</p>

          {/* ── Region Note ── */}
          <p style={regionNoteStyle}>
            {isAdmin
              ? `👑 Admin view — ${region === "india" ? "🇮🇳 Indian Terms" : "🌍 International Terms"} (change via Payment Mode in your profile)`
              : region === "india" ? "🇮🇳 Terms for Indian users" : "🌍 International Terms"
            }
          </p>
        </div>
      </div>

      <div style={bodyStyle}>
        {/* ── Sidebar ── */}
        <aside style={{ ...sidebarStyle, ...(scrolled ? sidebarStickyStyle : {}) }}>
          <div style={sidebarInnerStyle}>
            <div style={sidebarTitleStyle}>Contents</div>
            {LEGAL_SECTIONS.map((section) => {
              const isActive = activeTab === section.id;
              return (
                <button
                  key={section.id}
                  onClick={() => {
                    setActiveTab(section.id);
                    window.history.pushState(null, "", `#${section.id}`);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  style={{
                    ...sidebarItemStyle,
                    background: isActive ? section.bg : "transparent",
                    border: isActive ? `1px solid ${section.border}` : "1px solid transparent",
                    color: isActive ? section.color : "#374151",
                  }}
                >
                  <span style={sidebarIconStyle}>{section.icon}</span>
                  <span>{section.label}</span>
                  {isActive && <span style={{ marginLeft: "auto", fontSize: "10px" }}>◀</span>}
                </button>
              );
            })}
            <div style={sidebarContactStyle}>
              <div style={sidebarContactTitleStyle}>Need Help?</div>
              <a href="mailto:geneticbreeds@gmail.com" style={sidebarContactLinkStyle}>
                geneticbreeds@gmail.com
              </a>
            </div>
          </div>
        </aside>

        {/* ── Main Content ── */}
        <main style={mainStyle} ref={contentRef}>
          {/* Tab Pills — mobile */}
          <div style={tabRowStyle}>
            {LEGAL_SECTIONS.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveTab(section.id)}
                style={{
                  ...tabPillStyle,
                  background: activeTab === section.id ? section.color : "#f3f4f6",
                  color: activeTab === section.id ? "#fff" : "#374151",
                }}
              >
                {section.icon} {section.label}
              </button>
            ))}
          </div>

          {/* Section Header */}
          <div
            style={{
              ...sectionHeaderStyle,
              background: activeSection.bg,
              border: `1px solid ${activeSection.border}`,
            }}
          >
            <span style={sectionHeaderIconStyle}>{activeSection.icon}</span>
            <div>
              <div style={{ ...sectionHeaderTitleStyle, color: activeSection.color }}>
                {activeSection.label}
              </div>
              <div style={sectionHeaderSubStyle}>
                Click any section below to expand
              </div>
            </div>
          </div>

          {/* Accordion */}
          <div style={accordionWrapStyle}>
            {activeSection.items.map((item, index) => {
              const key = `${activeTab}-${index}`;
              const isOpen = !!openItems[key];
              return (
                <AccordionItem
                  key={key}
                  title={item.title}
                  content={item.content}
                  isOpen={isOpen}
                  onToggle={() => toggleItem(key)}
                  color={activeSection.color}
                  bg={activeSection.bg}
                  border={activeSection.border}
                  index={index}
                />
              );
            })}
          </div>

          {/* Expand All / Collapse All */}
          <div style={actionRowStyle}>
            <button
              onClick={() => {
                const all = {};
                activeSection.items.forEach((_, i) => { all[`${activeTab}-${i}`] = true; });
                setOpenItems(all);
              }}
              style={expandBtnStyle}
            >
              Expand All
            </button>
            <button onClick={() => setOpenItems({})} style={collapseBtnStyle}>
              Collapse All
            </button>
          </div>

          {/* Footer note */}
          <div style={footerNoteStyle}>
            <span style={{ fontSize: "18px" }}>📧</span>
            <span>
              Questions about our legal policies? Contact us at{" "}
              <a href="mailto:geneticbreeds@gmail.com" style={footerLinkStyle}>
                geneticbreeds@gmail.com
              </a>
            </span>
          </div>
        </main>
      </div>
    </div>
  );
}

// ─── ACCORDION ITEM ───────────────────────────────────────────────────────────
function AccordionItem({ title, content, isOpen, onToggle, color, bg, border, index }) {
  const bodyRef = useRef(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (bodyRef.current) {
      setHeight(isOpen ? bodyRef.current.scrollHeight : 0);
    }
  }, [isOpen, content]);

  const formattedContent = content.split("\n").map((line, i) => {
    if (line.startsWith("•")) {
      return <div key={i} style={bulletLineStyle}>{line}</div>;
    }
    if (line === "") return <br key={i} />;
    return <p key={i} style={contentParaStyle}>{line}</p>;
  });

  return (
    <div
      style={{
        ...accordionItemStyle,
        borderColor: isOpen ? border : "#e5e7eb",
        boxShadow: isOpen ? `0 4px 20px rgba(0,0,0,0.06)` : "none",
      }}
    >
      <button onClick={onToggle} style={accordionHeaderStyle}>
        <div style={accordionHeaderLeftStyle}>
          <span
            style={{
              ...accordionIndexStyle,
              background: isOpen ? color : "#f3f4f6",
              color: isOpen ? "#fff" : "#6b7280",
            }}
          >
            {String(index + 1).padStart(2, "0")}
          </span>
          <span style={{ ...accordionTitleStyle, color: isOpen ? color : "#111827" }}>
            {title}
          </span>
        </div>
        <span
          style={{
            ...accordionChevronStyle,
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
            color: isOpen ? color : "#9ca3af",
          }}
        >
          ▼
        </span>
      </button>

      <div style={{ height: `${height}px`, overflow: "hidden", transition: "height 0.35s cubic-bezier(0.4, 0, 0.2, 1)" }}>
        <div ref={bodyRef} style={{ ...accordionBodyStyle, background: isOpen ? bg : "#fff" }}>
          {formattedContent}
        </div>
      </div>
    </div>
  );
}

// ─── STYLES ───────────────────────────────────────────────────────────────────
const pageStyle = { minHeight: "100vh", background: "#f8fafc", fontFamily: "'Georgia', 'Times New Roman', serif" };
const heroStyle = { background: "linear-gradient(135deg, #7f1d1d 0%, #b91c1c 50%, #dc2626 100%)", padding: "60px 24px 50px", textAlign: "center", position: "relative", overflow: "hidden" };
const heroInnerStyle = { maxWidth: "700px", margin: "0 auto", position: "relative", zIndex: 1 };
const heroBadgeStyle = { display: "inline-block", background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)", borderRadius: "999px", padding: "6px 16px", fontSize: "11px", fontWeight: "700", letterSpacing: "1px", color: "#fff", marginBottom: "16px" };
const heroTitleStyle = { margin: 0, fontSize: "clamp(28px, 5vw, 48px)", fontWeight: "900", color: "#fff", lineHeight: 1.1, fontFamily: "'Georgia', serif" };
const heroSubStyle = { margin: "14px 0 0", fontSize: "16px", color: "rgba(255,255,255,0.88)", lineHeight: 1.7 };
const heroUpdatedStyle = { margin: "10px 0 0", fontSize: "12px", color: "rgba(255,255,255,0.6)", fontFamily: "monospace" };
const regionNoteStyle = { margin: "10px 0 0", fontSize: "11px", color: "rgba(255,255,255,0.65)", fontFamily: "sans-serif" };
const bodyStyle = { maxWidth: "1200px", margin: "0 auto", padding: "32px 20px 60px", display: "grid", gridTemplateColumns: "240px 1fr", gap: "28px", alignItems: "start" };
const sidebarStyle = { transition: "top 0.3s ease" };
const sidebarStickyStyle = { position: "sticky", top: "20px" };
const sidebarInnerStyle = { background: "#fff", borderRadius: "18px", border: "1px solid #e5e7eb", boxShadow: "0 4px 20px rgba(0,0,0,0.06)", padding: "18px", display: "flex", flexDirection: "column", gap: "6px" };
const sidebarTitleStyle = { fontSize: "10px", fontWeight: "900", color: "#9ca3af", letterSpacing: "1px", padding: "0 4px 8px", borderBottom: "1px solid #f3f4f6", marginBottom: "4px" };
const sidebarItemStyle = { display: "flex", alignItems: "center", gap: "10px", width: "100%", textAlign: "left", padding: "10px 12px", borderRadius: "12px", cursor: "pointer", fontSize: "13px", fontWeight: "700", transition: "all 0.2s ease", fontFamily: "sans-serif" };
const sidebarIconStyle = { fontSize: "16px", flexShrink: 0 };
const sidebarContactStyle = { marginTop: "12px", paddingTop: "12px", borderTop: "1px solid #f3f4f6" };
const sidebarContactTitleStyle = { fontSize: "11px", fontWeight: "800", color: "#6b7280", marginBottom: "6px", fontFamily: "sans-serif" };
const sidebarContactLinkStyle = { fontSize: "12px", color: "#b91c1c", fontWeight: "700", textDecoration: "none", wordBreak: "break-all", fontFamily: "sans-serif" };
const mainStyle = { display: "flex", flexDirection: "column", gap: "16px" };
const tabRowStyle = { display: "none", gap: "8px", flexWrap: "wrap" };
const tabPillStyle = { padding: "8px 14px", borderRadius: "999px", border: "none", cursor: "pointer", fontSize: "12px", fontWeight: "700", fontFamily: "sans-serif", transition: "all 0.2s ease" };
const sectionHeaderStyle = { display: "flex", alignItems: "center", gap: "16px", padding: "20px 24px", borderRadius: "16px" };
const sectionHeaderIconStyle = { fontSize: "32px", flexShrink: 0 };
const sectionHeaderTitleStyle = { fontSize: "22px", fontWeight: "900", margin: 0, fontFamily: "'Georgia', serif" };
const sectionHeaderSubStyle = { fontSize: "13px", color: "#6b7280", marginTop: "4px", fontFamily: "sans-serif" };
const accordionWrapStyle = { display: "flex", flexDirection: "column", gap: "10px" };
const accordionItemStyle = { background: "#fff", borderRadius: "14px", border: "1px solid #e5e7eb", overflow: "hidden", transition: "all 0.25s ease" };
const accordionHeaderStyle = { display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", padding: "16px 20px", background: "transparent", border: "none", cursor: "pointer", textAlign: "left", gap: "14px" };
const accordionHeaderLeftStyle = { display: "flex", alignItems: "center", gap: "14px", flex: 1, minWidth: 0 };
const accordionIndexStyle = { width: "32px", height: "32px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: "900", flexShrink: 0, transition: "all 0.25s ease", fontFamily: "monospace" };
const accordionTitleStyle = { fontSize: "15px", fontWeight: "800", lineHeight: 1.4, transition: "color 0.2s ease", fontFamily: "sans-serif" };
const accordionChevronStyle = { fontSize: "11px", flexShrink: 0, transition: "transform 0.35s cubic-bezier(0.4, 0, 0.2, 1), color 0.2s ease" };
const accordionBodyStyle = { padding: "0 20px 20px 66px", transition: "background 0.25s ease" };
const contentParaStyle = { margin: "0 0 10px", fontSize: "14px", color: "#374151", lineHeight: 1.8, fontFamily: "sans-serif" };
const bulletLineStyle = { fontSize: "14px", color: "#374151", lineHeight: 1.9, paddingLeft: "4px", fontFamily: "sans-serif" };
const actionRowStyle = { display: "flex", gap: "10px", justifyContent: "flex-end" };
const expandBtnStyle = { padding: "8px 16px", borderRadius: "10px", border: "1px solid #d1d5db", background: "#fff", color: "#374151", fontSize: "12px", fontWeight: "700", cursor: "pointer", fontFamily: "sans-serif" };
const collapseBtnStyle = { ...expandBtnStyle, background: "#f3f4f6" };
const footerNoteStyle = { display: "flex", alignItems: "center", gap: "12px", background: "#fff", border: "1px solid #e5e7eb", borderRadius: "14px", padding: "16px 20px", fontSize: "14px", color: "#374151", fontFamily: "sans-serif" };
const footerLinkStyle = { color: "#b91c1c", fontWeight: "700", textDecoration: "none" };
