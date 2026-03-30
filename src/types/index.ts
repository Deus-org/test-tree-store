export interface Item {
  id: string | number;
  parent: string | number | null;
  [key: string]: any;
}
