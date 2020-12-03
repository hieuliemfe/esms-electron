export type ServiceInfo = {
  id: number;
  name: string;
  code: string;
};

export type CategoryInfo = {
  id: number;
  categoryName: string;
  subtitle: string;
  Services?: ServiceInfo[];
};
