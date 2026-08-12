import type {
  AlibabaCatalogProvider,
  CatalogFetchOptions,
  CatalogFetchResult,
  NormalizedSupplierProduct,
  SupplierVariant,
} from "@/lib/alibaba-import/types";

type MockProductSeed = {
  originalTitle: string;
  sku: string;
  productId: string;
  images: string[];
  priceMin: number;
  priceMax: number;
  shippingCost: number;
  moq: number;
  category: string;
  application: string;
  description: string;
  variants: SupplierVariant[];
  processingTime: string;
};

const mockCatalog: MockProductSeed[] = [
  {
    originalTitle:
      "for bmw g20 g28 2019 2020 2021 m sport carbon fiber front bumper lip spoiler",
    sku: "GZ-G20-FLIP-01",
    productId: "1600123456789",
    images: [
      "/assets/products/g20-m-performance-carbon-front-lip-1.svg",
      "/assets/products/g20-m-performance-carbon-front-lip-2.svg",
    ],
    priceMin: 125,
    priceMax: 139,
    shippingCost: 55,
    moq: 1,
    category: "Front Bumper Lip",
    application: "BMW G20 G28 2019-2021 M Sport",
    description: "Factory carbon front lip for G20/G28 M Sport bumper, gloss or matte.",
    processingTime: "5-7 Business Days",
    variants: [
      {
        supplierVariantId: "1600123456789-gloss",
        supplierSku: "GZ-G20-FLIP-01-GLS",
        optionName: "Finish",
        optionValue: "Gloss Carbon",
        supplierCost: 125,
      },
      {
        supplierVariantId: "1600123456789-matte",
        supplierSku: "GZ-G20-FLIP-01-MAT",
        optionName: "Finish",
        optionValue: "Matte Carbon",
        supplierCost: 129,
      },
      {
        supplierVariantId: "1600123456789-frp",
        supplierSku: "GZ-G20-FLIP-01-FRP",
        optionName: "Material",
        optionValue: "FRP",
        supplierCost: 89,
      },
    ],
  },
  {
    originalTitle: "BMW G80 M3 dry carbon fiber rear trunk spoiler wing high quality OEM",
    sku: "GZ-G80-SPLR-02",
    productId: "1600123456790",
    images: ["/assets/products/g80-csl-style-carbon-grille-1.svg"],
    priceMin: 188,
    priceMax: 210,
    shippingCost: 62,
    moq: 1,
    category: "Rear Spoiler",
    application: "BMW G80 M3",
    description: "Dry carbon ducktail-style trunk spoiler for G80 M3.",
    processingTime: "7-10 Business Days",
    variants: [
      {
        supplierVariantId: "1600123456790-gloss",
        supplierSku: "GZ-G80-SPLR-02-GLS",
        optionName: "Finish",
        optionValue: "Gloss Carbon",
        supplierCost: 188,
      },
    ],
  },
  {
    originalTitle: "for bmw g82 g83 m4 carbon fiber side skirts extension lip 2021 2022 2023",
    sku: "GZ-G82-SKT-03",
    productId: "1600123456791",
    images: [
      "/assets/products/g82-carbon-side-skirts-1.svg",
      "/assets/products/g82-carbon-side-skirts-2.svg",
    ],
    priceMin: 240,
    priceMax: 260,
    shippingCost: 70,
    moq: 1,
    category: "Side Skirts",
    application: "BMW G82 G83 M4",
    description: "Extended carbon side skirts for G82/G83 M4.",
    processingTime: "5-8 Business Days",
    variants: [
      {
        supplierVariantId: "1600123456791-lhd",
        supplierSku: "GZ-G82-SKT-03-LHD",
        optionName: "Drive",
        optionValue: "Left Hand Drive",
        supplierCost: 240,
      },
      {
        supplierVariantId: "1600123456791-rhd",
        supplierSku: "GZ-G82-SKT-03-RHD",
        optionName: "Drive",
        optionValue: "Right Hand Drive",
        supplierCost: 248,
      },
    ],
  },
  {
    originalTitle: "BMW F90 M5 carbon fiber mirror caps replacement cover gloss",
    sku: "GZ-F90-MIR-04",
    productId: "1600123456792",
    images: ["/assets/products/g20-m340i-carbon-mirror-caps-1.svg"],
    priceMin: 96,
    priceMax: 110,
    shippingCost: 28,
    moq: 2,
    category: "Mirror Caps",
    application: "BMW F90 M5",
    description: "Replacement carbon mirror caps advertised for F90 M5.",
    processingTime: "4-6 Business Days",
    variants: [
      {
        supplierVariantId: "1600123456792-gloss",
        supplierSku: "GZ-F90-MIR-04-GLS",
        optionName: "Finish",
        optionValue: "Gloss Carbon",
        supplierCost: 96,
      },
    ],
  },
  {
    originalTitle: "for bmw g87 m2 carbon fiber interior trim dashboard cover panel",
    sku: "GZ-G87-INT-05",
    productId: "1600123456793",
    images: ["/assets/products/g20-m340i-carbon-mirror-caps-2.svg"],
    priceMin: 74,
    priceMax: 88,
    shippingCost: 22,
    moq: 1,
    category: "Interior Trim",
    application: "BMW G87 M2",
    description: "Interior carbon trim kit listed for G87 M2.",
    processingTime: "5-7 Business Days",
    variants: [
      {
        supplierVariantId: "1600123456793-gloss",
        supplierSku: "GZ-G87-INT-05-GLS",
        optionName: "Finish",
        optionValue: "Gloss Carbon",
        supplierCost: 74,
      },
    ],
  },
  {
    originalTitle: "Mercedes Benz W206 C-Class AMG line carbon fiber trunk spoiler rear wing",
    sku: "GZ-W206-SPLR-06",
    productId: "1600123456794",
    images: [
      "/assets/products/w206-carbon-trunk-spoiler-1.svg",
      "/assets/products/w206-carbon-trunk-spoiler-2.svg",
    ],
    priceMin: 156,
    priceMax: 175,
    shippingCost: 48,
    moq: 1,
    category: "Trunk Spoiler",
    application: "Mercedes-Benz W206 C-Class AMG Line",
    description: "Carbon trunk spoiler for W206 AMG Line decklid.",
    processingTime: "6-9 Business Days",
    variants: [
      {
        supplierVariantId: "1600123456794-prelci",
        supplierSku: "GZ-W206-SPLR-06-PRE",
        optionName: "Facelift",
        optionValue: "Pre-LCI",
        supplierCost: 156,
      },
      {
        supplierVariantId: "1600123456794-lci",
        supplierSku: "GZ-W206-SPLR-06-LCI",
        optionName: "Facelift",
        optionValue: "LCI",
        supplierCost: 164,
      },
    ],
  },
  {
    originalTitle: "for mercedes w205 c63 amg dry carbon fiber front lip splitter 2015-2021",
    sku: "GZ-W205-FLIP-07",
    productId: "1600123456795",
    images: ["/assets/products/audi-b9-rs-style-front-lip-1.svg"],
    priceMin: 142,
    priceMax: 160,
    shippingCost: 51,
    moq: 1,
    category: "Front Lip",
    application: "Mercedes-Benz W205 C63 AMG",
    description: "Dry carbon front lip advertised for W205 C63.",
    processingTime: "7-10 Business Days",
    variants: [
      {
        supplierVariantId: "1600123456795-dry",
        supplierSku: "GZ-W205-FLIP-07-DRY",
        optionName: "Material",
        optionValue: "Dry Carbon",
        supplierCost: 142,
      },
    ],
  },
  {
    originalTitle: "Mercedes W214 E-Class carbon fiber rear lip spoiler sedan 2024",
    sku: "GZ-W214-SPLR-08",
    productId: "1600123456796",
    images: ["/assets/products/w206-carbon-trunk-spoiler-3.svg"],
    priceMin: 118,
    priceMax: 130,
    shippingCost: 44,
    moq: 1,
    category: "Rear Lip",
    application: "Mercedes-Benz W214 E-Class",
    description: "Rear lip spoiler listed for W214 E-Class sedan.",
    processingTime: "5-8 Business Days",
    variants: [
      {
        supplierVariantId: "1600123456796-abs",
        supplierSku: "GZ-W214-SPLR-08-ABS",
        optionName: "Material",
        optionValue: "ABS",
        supplierCost: 118,
      },
    ],
  },
  {
    originalTitle: "Audi B9 B9.5 A4 S4 RS style carbon fiber front bumper lip 2017 2018 2019",
    sku: "GZ-B9-FLIP-09",
    productId: "1600123456797",
    images: [
      "/assets/products/audi-b9-rs-style-front-lip-1.svg",
      "/assets/products/audi-b9-rs-style-front-lip-2.svg",
    ],
    priceMin: 132,
    priceMax: 148,
    shippingCost: 46,
    moq: 1,
    category: "Front Lip",
    application: "Audi B9 A4 S4",
    description: "RS-style carbon front lip for B9 A4/S4.",
    processingTime: "5-7 Business Days",
    variants: [
      {
        supplierVariantId: "1600123456797-gloss",
        supplierSku: "GZ-B9-FLIP-09-GLS",
        optionName: "Finish",
        optionValue: "Gloss Carbon",
        supplierCost: 132,
      },
      {
        supplierVariantId: "1600123456797-matte",
        supplierSku: "GZ-B9-FLIP-09-MAT",
        optionName: "Finish",
        optionValue: "Matte Carbon",
        supplierCost: 136,
      },
    ],
  },
  {
    originalTitle: "for audi 8y a3 s3 rs3 carbon fiber rear diffuser bumper 2021 2022 2023",
    sku: "GZ-8Y-DIFF-10",
    productId: "1600123456798",
    images: ["/assets/products/porsche-718-carbon-rear-diffuser-1.svg"],
    priceMin: 198,
    priceMax: 220,
    shippingCost: 58,
    moq: 1,
    category: "Rear Diffuser",
    application: "Audi 8Y A3 S3 RS3",
    description: "Carbon rear diffuser advertised across 8Y A3/S3/RS3.",
    processingTime: "6-9 Business Days",
    variants: [
      {
        supplierVariantId: "1600123456798-rs3",
        supplierSku: "GZ-8Y-DIFF-10-RS3",
        optionName: "Fitment",
        optionValue: "RS3",
        supplierCost: 198,
      },
    ],
  },
  {
    originalTitle: "Audi C8 A6 S6 RS6 carbon fiber rear spoiler trunk wing",
    sku: "GZ-C8-SPLR-11",
    productId: "1600123456799",
    images: ["/assets/products/porsche-718-carbon-ducktail-spoiler-1.svg"],
    priceMin: 164,
    priceMax: 180,
    shippingCost: 49,
    moq: 1,
    category: "Rear Spoiler",
    application: "Audi C8 A6 S6 RS6",
    description: "Carbon trunk spoiler listed for C8 Audi models.",
    processingTime: "5-8 Business Days",
    variants: [
      {
        supplierVariantId: "1600123456799-gloss",
        supplierSku: "GZ-C8-SPLR-11-GLS",
        optionName: "Finish",
        optionValue: "Gloss Carbon",
        supplierCost: 164,
      },
    ],
  },
  {
    originalTitle: "Porsche 982 718 cayman boxster carbon fiber rear diffuser gt4 style",
    sku: "GZ-982-DIFF-12",
    productId: "1600123456800",
    images: [
      "/assets/products/porsche-718-carbon-rear-diffuser-1.svg",
      "/assets/products/porsche-718-carbon-rear-diffuser-2.svg",
    ],
    priceMin: 275,
    priceMax: 310,
    shippingCost: 72,
    moq: 1,
    category: "Rear Diffuser",
    application: "Porsche 982 718 Cayman Boxster",
    description: "GT4-style carbon rear diffuser for 982 718.",
    processingTime: "8-12 Business Days",
    variants: [
      {
        supplierVariantId: "1600123456800-gloss",
        supplierSku: "GZ-982-DIFF-12-GLS",
        optionName: "Finish",
        optionValue: "Gloss Carbon",
        supplierCost: 275,
      },
    ],
  },
  {
    originalTitle: "for porsche 992 911 carrera turbo carbon fiber front lip spoiler 2020-2024",
    sku: "GZ-992-FLIP-13",
    productId: "1600123456801",
    images: [
      "/assets/products/porsche-992-real-carbon-front-lip-1.svg",
      "/assets/products/porsche-992-real-carbon-front-lip-2.svg",
    ],
    priceMin: 310,
    priceMax: 345,
    shippingCost: 80,
    moq: 1,
    category: "Front Lip",
    application: "Porsche 992 911",
    description: "Carbon front lip for 992 Carrera/Turbo bumper families.",
    processingTime: "8-12 Business Days",
    variants: [
      {
        supplierVariantId: "1600123456801-carrera",
        supplierSku: "GZ-992-FLIP-13-CAR",
        optionName: "Bumper",
        optionValue: "Carrera",
        supplierCost: 310,
      },
      {
        supplierVariantId: "1600123456801-turbo",
        supplierSku: "GZ-992-FLIP-13-TUR",
        optionName: "Bumper",
        optionValue: "Turbo",
        supplierCost: 328,
      },
    ],
  },
  {
    originalTitle: "Porsche cayenne 9y 9ya 9yb carbon fiber rear roof spoiler 2019 2020 2021",
    sku: "GZ-9Y-SPLR-14",
    productId: "1600123456802",
    images: ["/assets/products/porsche-cayenne-9y-carbon-rear-spoiler-1.svg"],
    priceMin: 205,
    priceMax: 230,
    shippingCost: 66,
    moq: 1,
    category: "Rear Spoiler",
    application: "Porsche Cayenne 9Y 9YA 9YB",
    description: "Carbon roof spoiler for Cayenne 9Y coupe/SUV listings.",
    processingTime: "7-10 Business Days",
    variants: [
      {
        supplierVariantId: "1600123456802-coupe",
        supplierSku: "GZ-9Y-SPLR-14-CPE",
        optionName: "Body",
        optionValue: "Coupe",
        supplierCost: 205,
      },
    ],
  },
  {
    originalTitle: "Porsche 991 911 carbon fiber ducktail rear spoiler classic style",
    sku: "GZ-991-SPLR-15",
    productId: "1600123456803",
    images: ["/assets/products/porsche-718-carbon-ducktail-spoiler-1.svg"],
    priceMin: 226,
    priceMax: 250,
    shippingCost: 61,
    moq: 1,
    category: "Rear Spoiler",
    application: "Porsche 991 911",
    description: "Carbon ducktail spoiler advertised for 991 911.",
    processingTime: "7-11 Business Days",
    variants: [
      {
        supplierVariantId: "1600123456803-gloss",
        supplierSku: "GZ-991-SPLR-15-GLS",
        optionName: "Finish",
        optionValue: "Gloss Carbon",
        supplierCost: 226,
      },
    ],
  },
  {
    originalTitle: "BMW G80 G82 M3 M4 V style dry carbon fiber front lip splitter prepreg",
    sku: "GZ-G80-FLIP-16",
    productId: "1600123456804",
    images: [
      "/assets/products/bmw-g80-g82-v-style-dry-carbon-front-lip-1.svg",
      "/assets/products/bmw-g80-g82-v-style-dry-carbon-front-lip-2.svg",
    ],
    priceMin: 255,
    priceMax: 289,
    shippingCost: 68,
    moq: 1,
    category: "Front Lip",
    application: "BMW G80 G82 M3 M4",
    description: "V-style dry carbon front lip listed for G80/G82.",
    processingTime: "8-12 Business Days",
    variants: [
      {
        supplierVariantId: "1600123456804-g80",
        supplierSku: "GZ-G80-FLIP-16-G80",
        optionName: "Chassis",
        optionValue: "G80",
        supplierCost: 255,
      },
      {
        supplierVariantId: "1600123456804-g82",
        supplierSku: "GZ-G80-FLIP-16-G82",
        optionName: "Chassis",
        optionValue: "G82",
        supplierCost: 259,
      },
    ],
  },
];

function toNormalizedProduct(
  seed: MockProductSeed,
  catalogUrl: string,
  index: number
): NormalizedSupplierProduct {
  return {
    supplierProductId: seed.productId,
    supplierSku: seed.sku,
    originalTitle: seed.originalTitle,
    supplierUrl: `${catalogUrl.replace(/\/$/, "")}/product/${seed.productId}.html`,
    images: seed.images,
    supplierPriceMin: seed.priceMin,
    supplierPriceMax: seed.priceMax,
    currency: "USD",
    moq: seed.moq,
    description: seed.description,
    specifications: {
      category: seed.category,
      application: seed.application,
    },
    variants: seed.variants,
    rawVehicleApplication: seed.application,
    rawCategory: seed.category,
    shippingCost: seed.shippingCost,
    processingTime: seed.processingTime,
    rawProviderResponse: {
      provider: "mock",
      index,
      seed,
    },
  };
}

function paginate<T>(items: T[], pageSize: number) {
  const pages: T[][] = [];
  for (let index = 0; index < items.length; index += pageSize) {
    pages.push(items.slice(index, index + pageSize));
  }
  return pages;
}

export class MockAlibabaCatalogProvider implements AlibabaCatalogProvider {
  async fetchCatalog(url: string, options?: CatalogFetchOptions): Promise<CatalogFetchResult> {
    const pages = paginate(mockCatalog, 6);
    const products: NormalizedSupplierProduct[] = [];

    for (let pageIndex = 0; pageIndex < pages.length; pageIndex += 1) {
      await new Promise((resolve) => setTimeout(resolve, 250));
      const pageProducts = pages[pageIndex].map((seed, index) =>
        toNormalizedProduct(seed, url, pageIndex * 6 + index)
      );
      products.push(...pageProducts);
      await options?.onProgress?.({
        page: pageIndex + 1,
        productsOnPage: pageProducts.length,
        productsFound: products.length,
        message: `Page ${pageIndex + 1}`,
      });
    }

    return {
      products,
      pagesFetched: pages.length,
      failedProducts: 0,
    };
  }
}
