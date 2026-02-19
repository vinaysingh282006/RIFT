import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ErrorBoundary } from "@/app/ErrorBoundary";
import Navbar from "./components/Navbar";

const Dashboard = lazy(() => import("./pages/Dashboard"));
const Login = lazy(() => import("./pages/Login"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Patients = lazy(() => import("./pages/Patients"));
const Reports = lazy(() => import("./pages/Reports"));
const Analytics = lazy(() => import("./pages/Analytics"));

const queryClient = new QueryClient();

const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <Suspense fallback={<LoadingFallback />}>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/login" element={<Login />} />
                <Route path="/patients" element={<Patients />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;