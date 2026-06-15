import { useQuery } from "@tanstack/react-query";
import { metaApi, type AutoMenuGroup } from "@/api/metaApi";
import { useAuth } from "@/hooks/use-auth";

/**
 * Loads the auto-CRUD navigation from /api/meta/menu (already permission-filtered server-side).
 * Used to render framework-managed module menus without hardcoding them.
 */
export const useAutoMenu = () => {
  const { isAuthenticated } = useAuth();

  return useQuery<AutoMenuGroup[]>({
    queryKey: ["auto-menu"],
    queryFn: () => metaApi.getMenu(),
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
  });
};

export default useAutoMenu;
