// export type Template = {
//   category: string;
//   label: string;
//   emoji: string;
//   color: string; // tailwind bg color
//   message: (name: string) => string;
//   imageKeyword: string; // for display badge
// };

// export const TEMPLATES: Template[] = [
//   {
//     category: "restaurant",
//     label: "Restaurant",
//     emoji: "🍽️",
//     color: "bg-orange-500",
//     imageKeyword: "food",
//     message: (name) =>
//       `Hi ${name}! 👋\n\nWe help *restaurants like yours* get more customers through digital marketing — Social Media, Google Ads, and Online Ordering setup.\n\n📈 *Grow your restaurant business with us!*\n\nInterested? Reply YES or call us anytime. 😊`,
//   },
//   {
//     category: "salon",
//     label: "Salon & Spa",
//     emoji: "💅",
//     color: "bg-pink-500",
//     imageKeyword: "salon",
//     message: (name) =>
//       `Hi ${name}! 💇‍♀️\n\nWe specialize in growing *salons & beauty businesses* through Instagram marketing, Google reviews, and local SEO.\n\n✨ Get more bookings every day!\n\nWant to know more? Just reply YES! 🌸`,
//   },
//   {
//     category: "clinic",
//     label: "Clinic / Hospital",
//     emoji: "🏥",
//     color: "bg-blue-500",
//     imageKeyword: "clinic",
//     message: (name) =>
//       `Hi ${name}! 🩺\n\nWe help *clinics & healthcare providers* get more patients through Google Ads, Meta Ads & professional website design.\n\n📊 Digital presence that builds patient trust!\n\nReply YES to learn more. 🙏`,
//   },
//   {
//     category: "gym",
//     label: "Gym / Fitness",
//     emoji: "💪",
//     color: "bg-green-500",
//     imageKeyword: "gym",
//     message: (name) =>
//       `Hi ${name}! 💪\n\nWe help *gyms & fitness studios* get more members with targeted Facebook/Instagram ads and lead generation.\n\n🔥 More members = More revenue!\n\nInterested? Reply YES and we'll share a free plan! 🏋️`,
//   },
//   {
//     category: "real estate",
//     label: "Real Estate",
//     emoji: "🏠",
//     color: "bg-yellow-600",
//     imageKeyword: "real estate",
//     message: (name) =>
//       `Hi ${name}! 🏡\n\nWe help *real estate agents & builders* generate quality leads through Meta Ads, Google Ads & property portals.\n\n📍 Right leads. Right time. Right price.\n\nReply YES for a free consultation! 🤝`,
//   },
//   {
//     category: "retail",
//     label: "Retail Shop",
//     emoji: "🛍️",
//     color: "bg-purple-500",
//     imageKeyword: "retail",
//     message: (name) =>
//       `Hi ${name}! 🛍️\n\nWe help *retail businesses* increase footfall and online sales through social media marketing and WhatsApp campaigns.\n\n📣 Reach thousands of local customers!\n\nWant to grow? Reply YES! ✅`,
//   },
//   {
//     category: "education",
//     label: "Education / Coaching",
//     emoji: "📚",
//     color: "bg-indigo-500",
//     imageKeyword: "education",
//     message: (name) =>
//       `Hi ${name}! 📚\n\nWe help *coaching centers & schools* get more enrollments through digital marketing, lead generation & student outreach.\n\n🎓 Fill your seats with quality students!\n\nReply YES for a free strategy call! 🙌`,
//   },
//   {
//     category: "general",
//     label: "General Business",
//     emoji: "💼",
//     color: "bg-slate-500",
//     imageKeyword: "business",
//     message: (name) =>
//       `Hi ${name}! 👋\n\nWe help *businesses like yours* grow through digital marketing — Social Media, Google Ads & more.\n\n📈 Let's take your business to the next level!\n\nInterested? Reply YES and we'll get back to you! 😊`,
//   },
// ];

// export function getTemplate(category: string): Template {
//   const normalized = category.toLowerCase().trim();
//   return (
//     TEMPLATES.find(
//       (t) =>
//         t.category === normalized ||
//         normalized.includes(t.category) ||
//         t.category.includes(normalized)
//     ) || TEMPLATES[TEMPLATES.length - 1]
//   );
// }

// export function buildWhatsAppURL(phone: string, message: string): string {
//   const encoded = encodeURIComponent(message);
//   return `https://web.whatsapp.com/send?phone=${phone}&text=${encoded}`;
// }














// export type Template = {
//   category: string;
//   label: string;
//   emoji: string;
//   color: string; // tailwind bg color
//   message: (name: string) => string;
//   imageKeyword: string; // for display badge
//   imagePath?: string; // optional local image path to attach (shown in preview)
// };

// export const TEMPLATES: Template[] = [
//   {
//     category: "restaurant",
//     label: "Restaurant",
//     emoji: "🍽️",
//     color: "bg-orange-500",
//     imageKeyword: "food",
//     message: (name) =>
//       `Hi ${name}! 👋\n\nWe help *restaurants like yours* get more customers through digital marketing — Social Media, Google Ads, and Online Ordering setup.\n\n📈 *Grow your restaurant business with us!*\n\nInterested? Reply YES or call us anytime. 😊`,
//   },
//   {
//     category: "salon",
//     label: "Salon & Spa",
//     emoji: "💅",
//     color: "bg-pink-500",
//     imageKeyword: "salon",
//     imagePath: "/Salonimage.jpeg",
//     message: (name) =>
//       `Hi ${name} 👋,\nHope you're doing well! 😊\n\nI'm reaching out because we help salon owners attract more clients and grow their business online.\n\n💇‍♀️ Turn your salon into one of the most talked-about beauty destinations in your city!\n\nOur services include:\n✅ Professional Website Development\n✅ Google Business Profile Optimization\n✅ Social Media Marketing\n✅ Instagram & Facebook Ads\n✅ Branding & Creative Designs\n✅ Online Booking & Lead Generation\n\n🔥 Limited-Time Offer ~~₹25,000~~ → Just ₹15,000 (Onboarding)\n\nIf you're interested, I'd be happy to show you how we can help your salon get more bookings and build a stronger online presence.\n\n📞 Call/WhatsApp: +91 85878 70707\n🌐 https://www.marktaleworld.com/portfolio\n\nLooking forward to hearing from you!\n\nMarkTale\nTurning Your Tale Into Sales 🚀`,
//   },
//   {
//     category: "clinic",
//     label: "Clinic / Hospital",
//     emoji: "🏥",
//     color: "bg-blue-500",
//     imageKeyword: "clinic",
//     message: (name) =>
//       `Hi ${name}! 🩺\n\nWe help *clinics & healthcare providers* get more patients through Google Ads, Meta Ads & professional website design.\n\n📊 Digital presence that builds patient trust!\n\nReply YES to learn more. 🙏`,
//   },
//   {
//     category: "gym",
//     label: "Gym / Fitness",
//     emoji: "💪",
//     color: "bg-green-500",
//     imageKeyword: "gym",
//     message: (name) =>
//       `Hi ${name} 👋,\nHope you're doing well! 😊\n\nI'm reaching out because we help gym owners attract more members and grow their fitness business online.\n\n🏋️ Your gym builds stronger bodies. We build a stronger brand.\n\nOur services include:\n✅ Professional Website Development\n✅ Google Business Profile Optimization\n✅ Social Media Marketing\n✅ Instagram & Facebook Ads\n✅ Branding & Creative Designs\n✅ Membership Lead Generation\n\n🔥 Special Launch Offer ~~₹25,000~~ → Just ₹15,000 (Onboarding)\n\nIf you're looking to increase memberships and make your gym the first choice in your city, we'd love to help.\n\n📞 Call/WhatsApp: +91 85878 70707\n🌐 https://www.marktaleworld.com/portfolio\n\nLooking forward to hearing from you!\n\nMarkTale\nTurning Your Tale Into Sales 🚀`,
//   },
//   {
//     category: "real estate",
//     label: "Real Estate",
//     emoji: "🏠",
//     color: "bg-yellow-600",
//     imageKeyword: "real estate",
//     message: (name) =>
//       `Hi ${name}! 🏡\n\nWe help *real estate agents & builders* generate quality leads through Meta Ads, Google Ads & property portals.\n\n📍 Right leads. Right time. Right price.\n\nReply YES for a free consultation! 🤝`,
//   },
//   {
//     category: "retail",
//     label: "Retail Shop",
//     emoji: "🛍️",
//     color: "bg-purple-500",
//     imageKeyword: "retail",
//     message: (name) =>
//       `Hi ${name}! 🛍️\n\nWe help *retail businesses* increase footfall and online sales through social media marketing and WhatsApp campaigns.\n\n📣 Reach thousands of local customers!\n\nWant to grow? Reply YES! ✅`,
//   },
//   {
//     category: "education",
//     label: "Education / Coaching",
//     emoji: "📚",
//     color: "bg-indigo-500",
//     imageKeyword: "education",
//     message: (name) =>
//       `Hi ${name}! 📚\n\nWe help *coaching centers & schools* get more enrollments through digital marketing, lead generation & student outreach.\n\n🎓 Fill your seats with quality students!\n\nReply YES for a free strategy call! 🙌`,
//   },
//   {
//     category: "general",
//     label: "General Business",
//     emoji: "💼",
//     color: "bg-slate-500",
//     imageKeyword: "business",
//     message: (name) =>
//       `Hi ${name}! 👋\n\nWe help *businesses like yours* grow through digital marketing — Social Media, Google Ads & more.\n\n📈 Let's take your business to the next level!\n\nInterested? Reply YES and we'll get back to you! 😊`,
//   },
// ];

// export function getTemplate(category: string): Template {
//   const normalized = category.toLowerCase().trim();
//   return (
//     TEMPLATES.find(
//       (t) =>
//         t.category === normalized ||
//         normalized.includes(t.category) ||
//         t.category.includes(normalized)
//     ) || TEMPLATES[TEMPLATES.length - 1]
//   );
// }

// export function buildWhatsAppURL(phone: string, message: string): string {
//   const cleaned = phone.replace(/\D/g, "");
//   const encoded = encodeURIComponent(message);
//   return `https://web.whatsapp.com/send?phone=${cleaned}&text=${encoded}`;
// }











// export type Template = {
//   category: string;
//   label: string;
//   emoji: string;
//   color: string;
//   message: (name: string) => string;
//   imageKeyword: string;
//   imagePath?: string;
// };

// export const TEMPLATES: Template[] = [
//   {
//     category: "restaurant",
//     label: "Restaurant",
//     emoji: "🍽️",
//     color: "bg-orange-500",
//     imageKeyword: "food",
//     message: (name) =>
//       `Hi ${name}! 👋\n\nWe help *restaurants like yours* get more customers through digital marketing — Social Media, Google Ads, and Online Ordering setup.\n\n📈 *Grow your restaurant business with us!*\n\nInterested? Reply YES or call us anytime. 😊`,
//   },
//   {
//     category: "salon",
//     label: "Salon & Spa",
//     emoji: "💅",
//     color: "bg-pink-500",
//     imageKeyword: "salon",
//     imagePath: "https://i.ibb.co/Z047wdk/Salonimage.jpg",
//     message: (name) =>
//       `Hi ${name} 👋,\nHope you're doing well! 😊\n\nI'm reaching out because we help salon owners attract more clients and grow their business online.\n\n💇‍♀️ Turn your salon into one of the most talked-about beauty destinations in your city!\n\nOur services include:\n✅ Professional Website Development\n✅ Google Business Profile Optimization\n✅ Social Media Marketing\n✅ Instagram & Facebook Ads\n✅ Branding & Creative Designs\n✅ Online Booking & Lead Generation\n\n🔥 Limited-Time Offer ~~₹25,000~~ → Just ₹15,000 (Onboarding)\n\n🖼️ https://i.ibb.co/Z047wdk/Salonimage.jpg\n\nIf you're interested, I'd be happy to show you how we can help your salon get more bookings and build a stronger online presence.\n\n📞 Call/WhatsApp: +91 85878 70707\n🌐 https://www.marktaleworld.com/portfolio\n\nLooking forward to hearing from you!\n\nMarkTale\nTurning Your Tale Into Sales 🚀`,
//   },
//   {
//     category: "clinic",
//     label: "Clinic / Hospital",
//     emoji: "🏥",
//     color: "bg-blue-500",
//     imageKeyword: "clinic",
//     message: (name) =>
//       `Hi ${name}! 🩺\n\nWe help *clinics & healthcare providers* get more patients through Google Ads, Meta Ads & professional website design.\n\n📊 Digital presence that builds patient trust!\n\nReply YES to learn more. 🙏`,
//   },
//   {
//     category: "gym",
//     label: "Gym / Fitness",
//     emoji: "💪",
//     color: "bg-green-500",
//     imageKeyword: "gym",
//     message: (name) =>
//       `Hi ${name} 👋,\nHope you're doing well! 😊\n\nI'm reaching out because we help gym owners attract more members and grow their fitness business online.\n\n🏋️ Your gym builds stronger bodies. We build a stronger brand.\n\nOur services include:\n✅ Professional Website Development\n✅ Google Business Profile Optimization\n✅ Social Media Marketing\n✅ Instagram & Facebook Ads\n✅ Branding & Creative Designs\n✅ Membership Lead Generation\n\n🔥 Special Launch Offer ~~₹25,000~~ → Just ₹15,000 (Onboarding)\n\nIf you're looking to increase memberships and make your gym the first choice in your city, we'd love to help.\n\n📞 Call/WhatsApp: +91 85878 70707\n🌐 https://www.marktaleworld.com/portfolio\n\nLooking forward to hearing from you!\n\nMarkTale\nTurning Your Tale Into Sales 🚀`,
//   },
//   {
//     category: "real estate",
//     label: "Real Estate",
//     emoji: "🏠",
//     color: "bg-yellow-600",
//     imageKeyword: "real estate",
//     message: (name) =>
//       `Hi ${name}! 🏡\n\nWe help *real estate agents & builders* generate quality leads through Meta Ads, Google Ads & property portals.\n\n📍 Right leads. Right time. Right price.\n\nReply YES for a free consultation! 🤝`,
//   },
//   {
//     category: "retail",
//     label: "Retail Shop",
//     emoji: "🛍️",
//     color: "bg-purple-500",
//     imageKeyword: "retail",
//     message: (name) =>
//       `Hi ${name}! 🛍️\n\nWe help *retail businesses* increase footfall and online sales through social media marketing and WhatsApp campaigns.\n\n📣 Reach thousands of local customers!\n\nWant to grow? Reply YES! ✅`,
//   },
//   {
//     category: "education",
//     label: "Education / Coaching",
//     emoji: "📚",
//     color: "bg-indigo-500",
//     imageKeyword: "education",
//     message: (name) =>
//       `Hi ${name}! 📚\n\nWe help *coaching centers & schools* get more enrollments through digital marketing, lead generation & student outreach.\n\n🎓 Fill your seats with quality students!\n\nReply YES for a free strategy call! 🙌`,
//   },
//   {
//     category: "general",
//     label: "General Business",
//     emoji: "💼",
//     color: "bg-slate-500",
//     imageKeyword: "business",
//     message: (name) =>
//       `Hi ${name}! 👋\n\nWe help *businesses like yours* grow through digital marketing — Social Media, Google Ads & more.\n\n📈 Let's take your business to the next level!\n\nInterested? Reply YES and we'll get back to you! 😊`,
//   },
// ];

// export function getTemplate(category: string): Template {
//   const normalized = category.toLowerCase().trim();
//   return (
//     TEMPLATES.find(
//       (t) =>
//         t.category === normalized ||
//         normalized.includes(t.category) ||
//         t.category.includes(normalized)
//     ) || TEMPLATES[TEMPLATES.length - 1]
//   );
// }

// export function buildWhatsAppURL(phone: string, message: string): string {
//   const cleaned = phone.replace(/\D/g, "");
//   const encoded = encodeURIComponent(message);
//   return `https://web.whatsapp.com/send?phone=${cleaned}&text=${encoded}`;
// }















export type Template = {
  category: string;
  label: string;
  emoji: string;
  color: string;
  message: (name: string) => string;
  imageKeyword: string;
  imagePath?: string;
};

export const TEMPLATES: Template[] = [
  {
    category: "restaurant",
    label: "Restaurant",
    emoji: "🍽️",
    color: "bg-orange-500",
    imageKeyword: "food",
    message: (name) =>
      `Hi ${name}! 👋\n\nWe help *restaurants like yours* get more customers through digital marketing — Social Media, Google Ads, and Online Ordering setup.\n\n📈 *Grow your restaurant business with us!*\n\nInterested? Reply YES or call us anytime. 😊`,
  },
  {
    category: "salon",
    label: "Salon & Spa",
    emoji: "💅",
    color: "bg-pink-500",
    imageKeyword: "salon",
    imagePath: "https://res.cloudinary.com/dadouze3p/image/upload/v1783493211/Salonimage_g2plrp.jpg",
    message: (name) =>
      `Hi ${name} 👋,\nHope you're doing well! 😊\n\nI'm reaching out because we help salon owners attract more clients and grow their business online.\n\n💇‍♀️ Turn your salon into one of the most talked-about beauty destinations in your city!\n\nOur services include:\n✅ Professional Website Development\n✅ Google Business Profile Optimization\n✅ Social Media Marketing\n✅ Instagram & Facebook Ads\n✅ Branding & Creative Designs\n✅ Online Booking & Lead Generation\n\n🔥 Limited-Time Offer ~~₹25,000~~ → Just ₹15,000 (Onboarding)\n\n🖼️ https://res.cloudinary.com/dadouze3p/image/upload/v1783493211/Salonimage_g2plrp.jpg\n\nIf you're interested, I'd be happy to show you how we can help your salon get more bookings and build a stronger online presence.\n\n📞 Call/WhatsApp: +91 85878 70707\n🌐 https://www.marktaleworld.com/portfolio\n\nLooking forward to hearing from you!\n\nMarkTale\nTurning Your Tale Into Sales 🚀`,
  },
  {
    category: "clinic",
    label: "Clinic / Hospital",
    emoji: "🏥",
    color: "bg-blue-500",
    imageKeyword: "clinic",
    message: (name) =>
      `Hi ${name}! 🩺\n\nWe help *clinics & healthcare providers* get more patients through Google Ads, Meta Ads & professional website design.\n\n📊 Digital presence that builds patient trust!\n\nReply YES to learn more. 🙏`,
  },
  {
    category: "gym",
    label: "Gym / Fitness",
    emoji: "💪",
    color: "bg-green-500",
    imageKeyword: "gym",
    message: (name) =>
      `Hi ${name} 👋,\nHope you're doing well! 😊\n\nI'm reaching out because we help gym owners attract more members and grow their fitness business online.\n\n🏋️ Your gym builds stronger bodies. We build a stronger brand.\n\nOur services include:\n✅ Professional Website Development\n✅ Google Business Profile Optimization\n✅ Social Media Marketing\n✅ Instagram & Facebook Ads\n✅ Branding & Creative Designs\n✅ Membership Lead Generation\n\n🔥 Special Launch Offer ~~₹25,000~~ → Just ₹15,000 (Onboarding)\n\nIf you're looking to increase memberships and make your gym the first choice in your city, we'd love to help.\n\n📞 Call/WhatsApp: +91 85878 70707\n🌐 https://www.marktaleworld.com/portfolio\n\nLooking forward to hearing from you!\n\nMarkTale\nTurning Your Tale Into Sales 🚀`,
  },
  {
    category: "real estate",
    label: "Real Estate",
    emoji: "🏠",
    color: "bg-yellow-600",
    imageKeyword: "real estate",
    message: (name) =>
      `Hi ${name}! 🏡\n\nWe help *real estate agents & builders* generate quality leads through Meta Ads, Google Ads & property portals.\n\n📍 Right leads. Right time. Right price.\n\nReply YES for a free consultation! 🤝`,
  },
  {
    category: "retail",
    label: "Retail Shop",
    emoji: "🛍️",
    color: "bg-purple-500",
    imageKeyword: "retail",
    message: (name) =>
      `Hi ${name}! 🛍️\n\nWe help *retail businesses* increase footfall and online sales through social media marketing and WhatsApp campaigns.\n\n📣 Reach thousands of local customers!\n\nWant to grow? Reply YES! ✅`,
  },
  {
    category: "education",
    label: "Education / Coaching",
    emoji: "📚",
    color: "bg-indigo-500",
    imageKeyword: "education",
    message: (name) =>
      `Hi ${name}! 📚\n\nWe help *coaching centers & schools* get more enrollments through digital marketing, lead generation & student outreach.\n\n🎓 Fill your seats with quality students!\n\nReply YES for a free strategy call! 🙌`,
  },
  {
    category: "general",
    label: "General Business",
    emoji: "💼",
    color: "bg-slate-500",
    imageKeyword: "business",
    message: (name) =>
      `Hi ${name}! 👋\n\nWe help *businesses like yours* grow through digital marketing — Social Media, Google Ads & more.\n\n📈 Let's take your business to the next level!\n\nInterested? Reply YES and we'll get back to you! 😊`,
  },
];

export function getTemplate(category: string): Template {
  const normalized = category.toLowerCase().trim();
  return (
    TEMPLATES.find(
      (t) =>
        t.category === normalized ||
        normalized.includes(t.category) ||
        t.category.includes(normalized)
    ) || TEMPLATES[TEMPLATES.length - 1]
  );
}

export function buildWhatsAppURL(phone: string, message: string): string {
  const cleaned = phone.replace(/\D/g, "");
  const encoded = encodeURIComponent(message);
  return `https://web.whatsapp.com/send?phone=${cleaned}&text=${encoded}`;
}