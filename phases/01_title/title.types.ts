
export type UserIdentity = {
  id: string;
  kind: "user";
};

export type SelectionPool<T = import("../types").PlayerIdentity> = {
  id: string;
  items: T[];
  rules?: {
    maxPick?: number;
    filterTags?: string[];
  };
};

export type ExchangePath = "full" | "lite";

 
