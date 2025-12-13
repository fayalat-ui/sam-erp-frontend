import { sharePointClient } from "@/lib/sharepoint";
import {
  fetchDashboardCounts,
  type DashboardCounts,
} from "@/services/dashboardService";

// Adaptador simple: el Dashboard no sabe nada del cliente
export async function getDashboardCounts(): Promise<DashboardCounts> {
  return fetchDashboardCounts({
    getAll: (listName, options) =>
      sharePointClient.getListItems(
        listName,
        options?.select,
        options?.filter,
        options?.orderBy,
        options?.top
      ),
  });
}

export type { DashboardCounts };
