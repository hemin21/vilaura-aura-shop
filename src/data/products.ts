import { Product } from '@/types/product';

export const products: Product[] = [
  {
    id: '410606c0-7fbc-4b90-bafc-9f67251b3698', // Match database UUID
    name: 'CAFFÉSKIN',
    description: 'Energizing coffee-infused herbal soap that exfoliates and revitalizes your skin with natural caffeine.',
    price: 50,
    image: '/lovable-uploads/a470358d-bb23-48cf-a954-95f37d24b288.png',
    category: 'Herbal Soap',
    weight: '100gm',
    ingredients: ['Coffee grounds', 'Natural oils', 'Herbal extracts', 'Glycerin']
  },
  {
    id: '44428b40-8ec2-4774-b982-1851b56ecd5f', // Match database UUID
    name: 'LIMDA LEAF',
    description: 'Refreshing mint and herbal blend that cleanses deeply while providing a cooling sensation.',
    price: 40,
    image: '/lovable-uploads/c7e1058d-8c4d-472d-83a4-c54be24bc175.png',
    category: 'Herbal Soap',
    weight: '100gm',
    ingredients: ['Mint extract', 'Herbal oils', 'Natural cleansers', 'Essential oils']
  },
  {
    id: '625c341f-c879-42da-8f77-a5f47d574031', // Match database UUID
    name: 'GOLDEN GLOW',
    description: 'Luxurious turmeric and honey infusion for radiant, glowing skin with natural brightening properties.',
    price: 50,
    image: '/lovable-uploads/728515e7-8052-4f9d-8823-fab8ceceaee9.png',
    category: 'Herbal Soap',
    weight: '100gm',
    ingredients: ['Turmeric', 'Honey', 'Herbal extracts', 'Natural moisturizers']
  },
  {
    id: 'e29988ec-663c-48d2-ae75-332773a9d5f0', // Match database UUID
    name: 'KESUDA SOAP',
    description: 'Gentle glycerine-based soap perfect for sensitive skin, providing deep moisture and care.',
    price: 40,
    image: '/lovable-uploads/3a5b3e62-ac14-4900-905d-4ca03f4d7a1e.png',
    category: 'Glycerine Soap',
    weight: '100gm',
    ingredients: ['Pure glycerine', 'Natural oils', 'Gentle cleansers', 'Moisturizing agents']
  },
  {
    id: '44ce546f-2110-45dd-82bc-15612060c208', // Match database UUID
    name: 'KAPOOR COOL',
    description: 'Cooling camphor-infused soap that soothes and refreshes, perfect for hot weather relief.',
    price: 40,
    image: '/lovable-uploads/cdc16f79-2a11-4850-9d70-df631954c1ac.png',
    category: 'Herbal Soap',
    weight: '100gm',
    ingredients: ['Camphor', 'Cooling herbs', 'Natural oils', 'Soothing extracts']
  }
];