export interface MemoryItem {
  id: number;
  category: 'memories' | 'tim' | 'disney' | 'secret';
  emoji: string;
  imageUrl?: string; // Optional custom drawing or photo path
  title: string;
  price: string;
  plateColor: string;
  rimColor: string;
  memory: string;
  locked?: boolean;
}
