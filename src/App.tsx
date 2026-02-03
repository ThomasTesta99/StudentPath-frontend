import { Refine } from "@refinedev/core";
import { DevtoolsPanel, DevtoolsProvider } from "@refinedev/devtools";
import { RefineKbar, RefineKbarProvider } from "@refinedev/kbar";

import routerProvider, {
  DocumentTitleHandler,
  UnsavedChangesNotifier,
} from "@refinedev/react-router";
import { BrowserRouter, Route, Routes } from "react-router";
import "./App.css";
import { Toaster } from "./components/refine-ui/notification/toaster";
import { useNotificationProvider } from "./components/refine-ui/notification/use-notification-provider";
import { ThemeProvider } from "./components/refine-ui/theme/theme-provider";
import { dataProvider } from "./providers/data";

import Protected from "./components/Protected";
import Login from "./pages/auth/Login";
import { authProvider } from "./providers/auth";
import RoleRedirect from "./components/RoleRedirect";
import Admin from "./pages/admin/admin";

function App() {
  return (
    <BrowserRouter>
      <RefineKbarProvider>
        <ThemeProvider>
          <DevtoolsProvider>
            <Refine
              dataProvider={dataProvider}
              authProvider={authProvider}
              notificationProvider={useNotificationProvider()}
              routerProvider={routerProvider}
              options={{
                syncWithLocation: true,
                warnWhenUnsavedChanges: true,
                projectId: "ZbN2Dg-NsQtn9-u6kCxC",
              }}
            >
              <Routes>
                <Route path="/login" element={<Login />}/>
                <Route element = {<Protected />}>
                  <Route path="/" element={<RoleRedirect />}/>
                    <Route path="/admin" element = {<Admin/>}/>
                    <Route path="/teacher" element={<div>TEACHER</div>}/>
                    <Route path="/student" element={<div>STUDENT</div>}/>
                    <Route path="/parent" element={<div>PARENT</div>}/>

                </Route>
              </Routes>
              <Toaster />
              <RefineKbar />
              <UnsavedChangesNotifier />
              <DocumentTitleHandler />
            </Refine>
            <DevtoolsPanel />
          </DevtoolsProvider>
        </ThemeProvider>
      </RefineKbarProvider>
    </BrowserRouter>
  );
}

export default App;
