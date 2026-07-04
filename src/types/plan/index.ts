export type PlanCatalogType = {
  id: string;
  key: string; // unique slug, e.g. "base", "pro", "enterprise", "custom"
  name: string; // display name
  maxStaff: number;
  maxDoctors: number;
  price: number;
  editableCounts: boolean; // negotiated tier — counts can be overridden per clinic
  active: boolean;
  sortOrder: number;
};
