import { Route, Routes } from 'react-router-dom'
import { AppLayout } from '../layouts/AppLayout'
import { AdminDashboard } from '../pages/admin/AdminDashboard'
import { AdminCourses } from '../pages/admin/AdminCourses'
import { AdminEnrollments } from '../pages/admin/AdminEnrollments'
import { AdminSettings } from '../pages/admin/AdminSettings'
import { AdminUsers } from '../pages/admin/AdminUsers'
import { AdminProjects } from '../pages/admin/AdminProjects'
import { AdminLeads } from '../pages/admin/AdminLeads'
import { CourseDetail } from '../pages/CourseDetail'
import { Courses } from '../pages/Courses'
import { ForgotPassword } from '../pages/ForgotPassword'
import { Home } from '../pages/Home'
import { Learn } from '../pages/Learn'
import { Login } from '../pages/Login'
import { MyLearning } from '../pages/MyLearning'
import { NotFound } from '../pages/NotFound'
import { Profile } from '../pages/Profile'
import { Quiz } from '../pages/Quiz'
import { Register } from '../pages/Register'
import { ResetPassword } from '../pages/ResetPassword'
import { ProtectedRoute } from './ProtectedRoute'

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Home />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="forgot-password" element={<ForgotPassword />} />
        <Route path="reset-password" element={<ResetPassword />} />
        <Route path="courses" element={<Courses />} />
        <Route path="courses/:courseId" element={<CourseDetail />} />
        <Route element={<ProtectedRoute />}>
          <Route path="learn/:lessonId" element={<Learn />} />
          <Route path="quiz/:quizId" element={<Quiz />} />
          <Route path="my-learning" element={<MyLearning />} />
          <Route path="profile" element={<Profile />} />
        </Route>
        <Route element={<ProtectedRoute adminOnly />}>
          <Route path="admin" element={<AdminDashboard />} />
          <Route path="admin/courses" element={<AdminCourses />} />
          <Route path="admin/users" element={<AdminUsers />} />
          <Route path="admin/enrollments" element={<AdminEnrollments />} />
          <Route path="admin/settings" element={<AdminSettings />} />
          <Route path="admin/projects" element={<AdminProjects />} />
          <Route path="admin/leads" element={<AdminLeads />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
