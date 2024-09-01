interface GenericDataTable {
  id: string;
  name: string;
  tags: string[];
  data: { [key: string]: string };
}

export type { GenericDataTable };
