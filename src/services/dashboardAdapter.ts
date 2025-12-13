// src/services/dashboardAdapter.ts
import { sharePointClient } from "@/lib/sharepoint";
import { fetchDashboardCounts, type DashboardCounts } from "./dashboardService";

type SharePointQueryOptions = {
  select?: string;
  filter?: string;
  orderBy?: string;
  top?: number;
};

// Adaptador para que dashboardService use TU cliente actual (getListItems)
const spAdapter = {
  getAll: async <T = any>(listName: string, options?: SharePointQueryOptions): Promise<T[]> => {
    const select = options?.select ?? "*";
    const filter = options?.filter;
    const orderBy = options?.orderBy;
    const top = options?.top;

    // Tu cliente actual usa: getListItems(listName, select, filter, orderBy, top)
    return await sharePointClient.getListItems(listName, select, filter, orderBy, top);
  },
};

export type { DashboardCounts };

// Esto es lo que importará el Dashboard
export async function getDashboardCounts(): Promise<DashboardCounts> {
  return await fetchDashboardCounts(spAdapter);
}
