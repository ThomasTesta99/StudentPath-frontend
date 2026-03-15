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
import TermsList from "./pages/admin/terms/list";
import TermsCreate from "./pages/admin/terms/create";
import AdminLayout from "./components/Layouts/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import { allResources } from "./lib/resources";
import TermsShow from "./pages/admin/terms/show";
import EditTerm from "./pages/admin/terms/edit";
import DepartmentsList from "./pages/admin/departments/list";
import DepartmentsCreate from "./pages/admin/departments/create";
import DepartmentsShow from "./pages/admin/departments/show";
import EditDepartments from "./pages/admin/departments/edit";
import TeacherList from "./pages/admin/teachers/list";
import TeacherCreate from "./pages/admin/teachers/create";
import ShowTeacher from "./pages/admin/teachers/show";
import EditTeacher from "./pages/admin/teachers/edit";
import StudentsList from "./pages/admin/students/list";
import StudentCreate from "./pages/admin/students/create";
import ShowStudent from "./pages/admin/students/show";
import EditStudent from "./pages/admin/students/edit";
import ParentsList from "./pages/admin/parents/list";
import ParentCreate from "./pages/admin/parents/create";
import ShowParent from "./pages/admin/parents/show";
import EditParent from "./pages/admin/parents/edit";
import CoursesList from "./pages/admin/courses/list";
import CourseCreate from "./pages/admin/courses/create";
import ShowCourse from "./pages/admin/courses/show";
import EditCourse from "./pages/admin/courses/edit";
import SectionsList from "./pages/admin/sections/list";
import SectionCreate from "./pages/admin/sections/create";
import ShowSection from "./pages/admin/sections/show";
import EditSection from "./pages/admin/sections/edit";
import EnrollmentsList from "./pages/admin/enrollments/list";

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
              resources={allResources}
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
                            <Route path="show/:id" element={<TermsShow />} />
                            <Route path="edit/:id" element={<EditTerm />} />
                          </Route>
                          <Route path="departments">
                            <Route index element={<DepartmentsList />} />
                            <Route path="create" element={<DepartmentsCreate />} />
                            <Route path="show/:id" element={<DepartmentsShow />} />
                            <Route path="edit/:id" element={<EditDepartments />} />
                          </Route>
                          <Route path="teachers">
                            <Route index element={<TeacherList />}/>
                            <Route path="create" element={<TeacherCreate />} />
                            <Route path="show/:id" element={<ShowTeacher />} />
                            <Route path="edit/:id" element={<EditTeacher />} />
                          </Route>
                          <Route path="students">
                            <Route index element={<StudentsList />}/>
                            <Route path="create" element={<StudentCreate />} />
                            <Route path="show/:id" element={<ShowStudent />} />
                            <Route path="edit/:id" element={<EditStudent />} />
                          </Route>
                          <Route path="parents">
                            <Route index element={<ParentsList />} />
                            <Route path="create" element={<ParentCreate />} />
                            <Route path="show/:id" element={<ShowParent />} />
                            <Route path="edit/:id" element={<EditParent />} />
                          </Route>
                          <Route path="courses">
                            <Route index element={<CoursesList />} />
                            <Route path="create" element={<CourseCreate />}/>
                            <Route path="show/:id" element={<ShowCourse />} />
                            <Route path="edit/:id" element={<EditCourse />} />
                          </Route>
                          <Route path="sections">
                            <Route index element={<SectionsList />} />
                            <Route path="create" element={<SectionCreate />}/>
                            <Route path="show/:id" element={<ShowSection />} />
                            <Route path="edit/:id" element={<EditSection />} />
                          </Route>
                          <Route path="enrollments">
                            <Route index element={<EnrollmentsList />} />
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
