
import { TooltipProvider } from "@radix-ui/react-tooltip";//为全站 Tooltip 提供上下文（shadcn Tooltip 依赖它）
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";//服务端/异步数据缓存（余额、RPC 等）
import { BrowserRouter, Route, Routes } from "react-router-dom";//客户端路由
import { Toaster as Sonner } from "./components/ui/sonner";//两套 Toast 系统（Radix + Sonner）
import { Toaster } from "./components/ui/toaster";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import "./style.css"

// 一个「数据请求管理中心」——负责缓存、重试、刷新、去重等。
const queryClient = new QueryClient({})

export default function popup() {
  //获取当前路径
  const queryPath = window.location.pathname;
  console.log("currentPath", queryPath)

  return (
    // 把这个管理中心通过 React Context 传给整棵组件树，子组件才能用 useQuery 等 hook
    <QueryClientProvider client={queryClient}>
      {/* TooltipProvider = 给整页（或整棵组件树）开启「悬浮提示」能力的开关。没有它，下面这种 Tooltip 组件可能无法正常工作或行为异常。 */}
      <TooltipProvider>

        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
              <Route path="/popup.html" element={<div className='w-[400]'><Index /></div>} />
              <Route path="*" element={<div className="w-[400px]"><NotFound /></div>} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>

    </QueryClientProvider>
  )

}