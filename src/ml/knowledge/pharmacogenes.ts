
export interface GeneDefinition {
    symbol: string;
    name: string;
    chromosome: string;
    rsIds: string[]; // Key variants to look for
}

export const TARGET_GENES: Record<string, GeneDefinition> = {
    CYP2D6: {
        symbol: "CYP2D6",
        name: "Cytochrome P450 2D6",
        chromosome: "22",
        rsIds: ["rs3892097", "rs1065852", "rs16947", "rs28371725"] // *4, *10, *2, *41
    },
    CYP2C19: {
        symbol: "CYP2C19",
        name: "Cytochrome P450 2C19",
        chromosome: "10",
        rsIds: ["rs4244285", "rs4986893"] // *2, *3
    },
    CYP2C9: {
        symbol: "CYP2C9",
        name: "Cytochrome P450 2C9",
        chromosome: "10",
        rsIds: ["rs1799853", "rs1057910"] // *2, *3
    },
    VKORC1: {
        symbol: "VKORC1",
        name: "Vitamin K Epoxide Reductase",
        chromosome: "16",
        rsIds: ["rs9923231"] // -1639G>A
    },
    SLCO1B1: {
        symbol: "SLCO1B1",
        name: "Solute Carrier Organic Anion Transporter 1B1",
        chromosome: "12",
        rsIds: ["rs4149056"] // *5
    },
    TPMT: {
        symbol: "TPMT",
        name: "Thiopurine S-Methyltransferase",
        chromosome: "6",
        rsIds: ["rs1142345", "rs1800460", "rs1800462"] // *3A, *2, *3C
    },
    DPYD: {
        symbol: "DPYD",
        name: "Dihydropyrimidine Dehydrogenase",
        chromosome: "1",
        rsIds: ["rs67376798", "rs56038477", "rs1861112"] // IVS14+1G>A, c.1905+1G>A, c.1129-5923C>G
    }
};
