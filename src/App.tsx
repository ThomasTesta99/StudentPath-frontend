import { Refine} from "@refinedev/core";
import { DevtoolsPanel, DevtoolsProvider } from "@refinedev/devtools";
import { RefineKbar, RefineKbarProvider } from "@refinedev/kbar";

import routerProvider, {
  UnsavedChangesNotifier,
} from "@refinedev/react-router";
import { BrowserRouter, Outlet, Route, Routes } from "react-router";
import "./App.css";
import { Toaster } from "./components/refine-ui/notification/toaster";
import { useNotificationProvider } from "./components/refine-ui/notification/use-notification-provider";
import { ThemeProvider } from "./components/refine-ui/theme/theme-provider";
import { dataProvider } from "./providers/data";

import Protected from "./components/Protected";
import { authProvider } from "./providers/auth";
import RoleRedirect from "./components/RoleRedirect";
import { RequireRole } from "./components/RequireRole";
import LoginPage from "./pages/auth/LoginPage";
import { Layout } from "./components/refine-ui/layout/layout";
import { GraduationCap } from "lucide-react";
import Parentdash from "./pages/parent/parentdash";
import { useEffect, useMemo, useState } from "react";
import { allResources } from "./lib/resources";
import { User } from "./types";
import TermsList from "./pages/admin/terms/list";
import TermsCreate from "./pages/admin/terms/create";
import AdminLayout from "./components/Layouts/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";

type ProfileRole = "admin" | "teacher" | "student" | "parent";

function App() {
  const notificationProvider = useNotificationProvider();
  const [role, setRole] = useState<ProfileRole | null>(null);
  const [loadingRole, setLoadingRole] = useState(true);

  useEffect(() => {
    (async () => {
      const identity = await authProvider.getIdentity?.();
      setRole((identity as User)?.profileRole ?? null);
      setLoadingRole(false);
    })();
  }, []);

  const resources = useMemo(() => {
    if (!role) return allResources;
    return allResources.filter((r) => {
      const roles = r.meta?.roles as ProfileRole[] | undefined;
      return !roles || roles.includes(role);
    });
  }, [role]);
  if (loadingRole) return null;
  return (
    <BrowserRouter>
      <RefineKbarProvider>
        <ThemeProvider>
          <DevtoolsProvider>
            <Refine
              dataProvider={dataProvider}
              authProvider={authProvider}
              notificationProvider={notificationProvider}
              routerProvider={routerProvider}
              resources={resources}
              options={{
                syncWithLocation: true,
                warnWhenUnsavedChanges: true,
                projectId: "ZbN2Dg-NsQtn9-u6kCxC",
                title:{
                  text: "StudentPath",
                  icon: <GraduationCap/>
                }
              }}
            >
              <Routes>
                <Route path="/login" element={<LoginPage/>}/>
                <Route element = {
                  <Layout>
                    <Outlet />
                  </Layout>
                }>
                  <Route element = {<Protected />}>
                    
                      <Route path="/" element={<RoleRedirect />} />

                      <Route element={<RequireRole allow={["admin"]} />}>
                        <Route path="/admin" element={<AdminLayout />}>
                          <Route index element={<AdminDashboard />} />
                          <Route path="terms">
                            <Route index element={<TermsList />} />
                            <Route path="create" element={<TermsCreate />} />
                          </Route>
                        
                        </Route>
                      </Route>

                      <Route element={<RequireRole allow={["teacher"]} />}>
                        <Route path="/teacher" element={<div>TEACHER</div>} />
                      </Route>

                      <Route element={<RequireRole allow={["student"]} />}>
                        <Route path="/student" element={<div>STUDENT</div>} />
                      </Route>

                      <Route element={<RequireRole allow={["parent"]} />}>
                        <Route path="/parent" element={<Parentdash />} />
                      </Route>
                    
                  </Route>
                </Route>
              </Routes>
              <Toaster />
              <RefineKbar />
              <UnsavedChangesNotifier />
            </Refine>
            <DevtoolsPanel />
          </DevtoolsProvider>
        </ThemeProvider>
      </RefineKbarProvider>
    </BrowserRouter>
  );
}

export default App;
