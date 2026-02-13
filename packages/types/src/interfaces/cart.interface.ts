export interface ICartItem {
  id: string;
  name: string;
  sale_price: number | string;
  quantity: number;
  image_base64?: string | null;
}
