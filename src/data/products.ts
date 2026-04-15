export interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  tag?: string;
  image: string;
  category: string;
}

export interface Collection {
  id: number;
  name: string;
  itemCount: number;
  image: string;
  slug: string;
}

export const newArrivals: Product[] = [
  {
    id: 1,
    name: "Sport Pullover Hoodie",
    price: 38,
    tag: "NEW",
    image: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=400&q=80",
    category: "Hoodies",
  },
  {
    id: 2,
    name: "Classic Snapback Cap",
    price: 22,
    tag: "NEW",
    image: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=400&q=80",
    category: "Accessories",
  },
  {
    id: 3,
    name: "Cargo Jogger Pants",
    price: 45,
    originalPrice: 60,
    tag: "SALE",
    image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&q=80",
    category: "Bottoms",
  },
  {
    id: 4,
    name: "Graphic Print Tee",
    price: 18,
    tag: "NEW",
    image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&q=80",
    category: "Tops",
  },
];

export const featuredCollections: Collection[] = [
  {
    id: 1,
    name: "Streetwear",
    itemCount: 24,
    image: "https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=600&q=80",
    slug: "streetwear",
  },
  {
    id: 2,
    name: "Activewear",
    itemCount: 18,
    image: "https://images.unsplash.com/photo-1571945153237-4929e783af4a?w=600&q=80",
    slug: "activewear",
  },
  {
    id: 3,
    name: "Accessories",
    itemCount: 32,
    image: "https://images.unsplash.com/photo-1575428652377-a2d80e2277fc?w=600&q=80",
    slug: "accessories",
  },
  {
    id: 4,
    name: "Bottoms",
    itemCount: 15,
    image: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600&q=80",
    slug: "bottoms",
  },
];
