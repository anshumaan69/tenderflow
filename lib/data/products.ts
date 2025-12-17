export interface Product {
  id: string;
  name: string;
  category: "Cable" | "Wire" | "Switchgear" | "Accessory";
  specs: {
    voltage: string;
    material: string;
    core: string;
    insulation: string;
    type?: string;
    rating?: string;
  };
  description: string;
}

export const PRODUCTS: Product[] = [
  // HV Cables
  {
    id: "CBL-HV-001",
    name: "11kV XLPE 3-Core Aluminum Cable",
    category: "Cable",
    specs: { voltage: "11kV", material: "Aluminum", core: "3-Core", insulation: "XLPE" },
    description: "Heavy duty high voltage power transmission cable, armored."
  },
  {
    id: "CBL-HV-002",
    name: "33kV XLPE 3-Core Copper Cable",
    category: "Cable",
    specs: { voltage: "33kV", material: "Copper", core: "3-Core", insulation: "XLPE" },
    description: "Premium high voltage cable for industrial substations."
  },
  {
    id: "CBL-HV-003",
    name: "11kV PILC 3-Core Lead Sheathed Cable",
    category: "Cable",
    specs: { voltage: "11kV", material: "Copper", core: "3-Core", insulation: "Paper" },
    description: "Traditional paper insulated lead covered cable for underground use."
  },

  // LV Cables
  {
    id: "CBL-LV-001",
    name: "1.1kV PVC 4-Core Aluminum Cable",
    category: "Cable",
    specs: { voltage: "1.1kV", material: "Aluminum", core: "4-Core", insulation: "PVC" },
    description: "Standard low voltage distribution cable."
  },
  {
    id: "CBL-LV-002",
    name: "1.1kV XLPE 4-Core Copper Cable",
    category: "Cable",
    specs: { voltage: "1.1kV", material: "Copper", core: "4-Core", insulation: "XLPE" },
    description: "High performance low voltage cable for commercial buildings."
  },
  {
    id: "CBL-LV-003",
    name: "1.1kV Control Cable 12-Core",
    category: "Cable",
    specs: { voltage: "1.1kV", material: "Copper", core: "12-Core", insulation: "PVC" },
    description: "Multi-core control cable for instrumentation."
  },

  // Wires (House)
  {
    id: "WIR-Hs-001",
    name: "FR House Wire 1.5sqmm",
    category: "Wire",
    specs: { voltage: "1100V", material: "Copper", core: "1-Core", insulation: "FR-PVC" },
    description: "Flame retardant house wiring."
  },
  {
    id: "WIR-Hs-002",
    name: "FRLS House Wire 2.5sqmm",
    category: "Wire",
    specs: { voltage: "1100V", material: "Copper", core: "1-Core", insulation: "FRLS-PVC" },
    description: "Flame retardant low smoke wire for high-rises."
  },
  {
    id: "WIR-Hs-003",
    name: "ZHFR House Wire 4.0sqmm",
    category: "Wire",
    specs: { voltage: "1100V", material: "Copper", core: "1-Core", insulation: "ZHFR" },
    description: "Zero halogen flame retardant wire for critical safety."
  },

  // Switchgear / Industrial
  {
    id: "SWG-MCCB-001",
    name: "MCCB 100A 3P 25kA",
    category: "Switchgear",
    specs: { voltage: "415V", material: "N/A", core: "3-Pole", rating: "100A", insulation: "N/A" },
    description: "Molded case circuit breaker for industrial protection."
  },
  {
    id: "SWG-ACB-001",
    name: "ACB 800A 3P Drawout",
    category: "Switchgear",
    specs: { voltage: "415V", material: "N/A", core: "3-Pole", rating: "800A", insulation: "N/A" },
    description: "Air circuit breaker for main distribution panels."
  },
  
  // Accessories
  {
    id: "ACC-LUG-001",
    name: "Aluminum Cable Lug 185sqmm",
    category: "Accessory",
    specs: { voltage: "N/A", material: "Aluminum", core: "N/A", insulation: "N/A" },
    description: "Crimping lug for 185sqmm cable."
  },
  {
    id: "ACC-GLAND-001",
    name: "Double Compression Cable Gland",
    category: "Accessory",
    specs: { voltage: "N/A", material: "Brass", core: "N/A", insulation: "N/A" },
    description: "Heavy duty brass gland for armored cables."
  }
];
