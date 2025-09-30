export const homeTranslations = {
  en: {
    // Hero Section
    heroTitle: "Give your business the power to advertise in real-time",
    heroSubtitle: "Create instant promotions, reach local customers, and boost sales with our easy-to-use dashboard. First month free, then just $10 per month.",
    startFreeTrial: "Start Free Trial",
    followSocialMedia: "Follow us on social media",
    
    // Business Steps Section
    businessSectionTitle: "Real-Time Advertising Made Simple",
    businessSectionSubtitle: "Create, publish, and track ads instantly with our easy-to-use dashboard",
    testDashboard: "Test our simple dashboard!",
    demoDashboard: "Demo the Business Dashboard",
    
    // Business Steps
    step1Title: "Create Real-Time Promotions",
    step1Caption: "Instantly create targeted ads for slow days, overstock items, or special events. No waiting, no delays - just immediate advertising power.",
    step2Title: "Reach Local Customers Instantly",
    step2Caption: "Your promotions appear immediately to customers in your area. No expensive ad agencies or complex campaigns needed.",
    step3Title: "Track Results and Boost Sales",
    step3Caption: "Watch customers respond to your ads in real-time. Simple dashboard shows you exactly what's working.",
    
    // Customer Steps Section
    customerSectionTitle: "How Customers Use QRewards",
    customerSectionSubtitle: "A seamless experience that keeps customers coming back",
    getFullExperience: "Get the full customer experience!",
    demoCustomerExperience: "Demo the Customer Experience",
    
    // Customer Steps
    customerStep1Title: "Discover Rewards",
    customerStep1Caption: "Customers generate a reward by scanning a QR code located in your area.",
    customerStep2Title: "Claim via Email or SMS",
    customerStep2Caption: "If relevant, customers will claim and receive the reward via email or SMS.",
    customerStep3Title: "Redeem In-Store",
    customerStep3Caption: "Fast, easy redemption with just two taps in-store—no POS integration needed.",
    
    // Final CTA Section
    finalCtaTitle: "Ready to advertise in real-time?",
    finalCtaButton: "Start Free Trial",
    finalCtaSubtext: "First month free • $10 per month after • Easy dashboard • Cancel anytime",
    
    // Footer
    footerText: "© 2024 QRewards. Connecting businesses with customers.",
    
    // Customer Demo Modal
    customerDemoTitle: "Try the Customer Experience",
    customerDemoDescription: "Enter your zip code to see available rewards in your area:",
    customerDemoPlaceholder: "Enter zip code (e.g., 12345)",
    customerDemoSubmit: "View Rewards",
    customerDemoCancel: "Cancel",
    
    // Image Alt Text
    altSmallBusinessOwner: "Small Business Owner",
    altCafe: "Cafe",
    altDogGroomer: "Dog Groomer",
    altPilatesStudio: "Pilates Studio",
    altBoutiqueOwner: "Boutique Owner",
    altCarpenter: "Carpenter",
    altHairDresser: "Hair Dresser",
    altPizzaRestaurant: "Pizza Restaurant",
  },
  es: {
    // Hero Section
    heroTitle: "Otorgue a su negocio el poder de publicitar en tiempo real",
    heroSubtitle: "Cree promociones instantáneas, alcance clientes locales y aumente las ventas con nuestro panel de control fácil de usar. Primer mes gratis, luego solo $10 por mes.",
    startFreeTrial: "Iniciar Prueba Gratuita",
    followSocialMedia: "Síganos en redes sociales",
    
    // Business Steps Section
    businessSectionTitle: "Publicidad en Tiempo Real Simplificada",
    businessSectionSubtitle: "Cree, publique y rastree anuncios instantáneamente con nuestro panel de control fácil de usar",
    testDashboard: "¡Pruebe nuestro panel simple!",
    demoDashboard: "Demostración del Panel de Negocios",
    
    // Business Steps
    step1Title: "Cree Promociones en Tiempo Real",
    step1Caption: "Cree instantáneamente anuncios dirigidos para días lentos, artículos de exceso de inventario o eventos especiales. Sin esperas, sin demoras - solo poder publicitario inmediato.",
    step2Title: "Alcance Clientes Locales Instantáneamente",
    step2Caption: "Sus promociones aparecen inmediatamente para los clientes en su área. No se necesitan agencias de publicidad costosas ni campañas complejas.",
    step3Title: "Rastree Resultados y Aumente las Ventas",
    step3Caption: "Observe cómo los clientes responden a sus anuncios en tiempo real. El panel simple le muestra exactamente qué está funcionando.",
    
    // Customer Steps Section
    customerSectionTitle: "Cómo los Clientes Usan QRewards",
    customerSectionSubtitle: "Una experiencia fluida que mantiene a los clientes regresando",
    getFullExperience: "¡Obtenga la experiencia completa del cliente!",
    demoCustomerExperience: "Demostración de la Experiencia del Cliente",
    
    // Customer Steps
    customerStep1Title: "Descubra Recompensas",
    customerStep1Caption: "Los clientes generan una recompensa escaneando un código QR ubicado en su área.",
    customerStep2Title: "Reclame por Correo Electrónico o SMS",
    customerStep2Caption: "Si es relevante, los clientes reclamarán y recibirán la recompensa por correo electrónico o SMS.",
    customerStep3Title: "Canjee en la Tienda",
    customerStep3Caption: "Canje rápido y fácil con solo dos toques en la tienda - no se necesita integración de punto de venta.",
    
    // Final CTA Section
    finalCtaTitle: "¿Listo para publicitar en tiempo real?",
    finalCtaButton: "Iniciar Prueba Gratuita",
    finalCtaSubtext: "Primer mes gratis • $10 por mes después • Panel fácil • Cancele en cualquier momento",
    
    // Footer
    footerText: "© 2024 QRewards. Conectando negocios con clientes.",
    
    // Customer Demo Modal
    customerDemoTitle: "Pruebe la Experiencia del Cliente",
    customerDemoDescription: "Ingrese su código postal para ver las recompensas disponibles en su área:",
    customerDemoPlaceholder: "Ingrese código postal (ej., 12345)",
    customerDemoSubmit: "Ver Recompensas",
    customerDemoCancel: "Cancelar",
    
    // Image Alt Text
    altSmallBusinessOwner: "Propietario de Pequeño Negocio",
    altCafe: "Café",
    altDogGroomer: "Peluquero de Perros",
    altPilatesStudio: "Estudio de Pilates",
    altBoutiqueOwner: "Propietario de Boutique",
    altCarpenter: "Carpintero",
    altHairDresser: "Peluquero",
    altPizzaRestaurant: "Restaurante de Pizza",
  }
} as const;

export type TranslationKey = keyof typeof homeTranslations.en;

