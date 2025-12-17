export const PRODUCT_PRICING: Record<string, number> = {
  "CBL-HV-001": 1200, // Per Meter
  "CBL-HV-002": 2500,
  "CBL-HV-003": 1800,
  "CBL-LV-001": 450,
  "CBL-LV-002": 850,
  "CBL-LV-003": 250,
  "WIR-Hs-001": 15,   // Per Meter
  "WIR-Hs-002": 28,
  "WIR-Hs-003": 45,
  "SWG-MCCB-001": 3500, // Per Unit
  "SWG-ACB-001": 45000,
  "ACC-LUG-001": 45,
  "ACC-GLAND-001": 350
};

export const SERVICE_PRICING: Record<string, number> = {
  "TEST-HV": 15000,      // High Voltage Test
  "TEST-ROUTINE": 5000,  // Routine Test
  "TEST-TYPE": 50000,    // Type Test (Expensive)
  "INSP-FACTORY": 10000, // Factory Acceptance Test
  "INSP-SITE": 20000,    // Site Inspection
  "LOGISTICS": 25000,    // Standard Shipping
  "COMMISSIONING": 45000 // On-site commissioning
};

// Start keyword matching for services
export const SERVICE_KEYWORDS: Record<string, string[]> = {
  "TEST-HV": ["high voltage test", "hv test", "insulation resistance"],
  "TEST-TYPE": ["type test", "short circuit test", "impulse test", "temperature rise"],
  "INSP-FACTORY": ["factory acceptance", "fat", "pre-dispatch inspection", "witness test"],
  "INSP-SITE": ["site acceptance", "sat", "commissioning support"],
  "COMMISSIONING": ["installation and commissioning", "start-up support"]
};
