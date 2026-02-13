import { useState } from "react"
import Sidebar from "./Sidebar"
import Topbar from "./Topbar"
import { Outlet } from "react-router-dom"

export default function Layout() {
  const [open, setOpen] = useState(false)

  return (
    <div className="layout flex min-h-screen bg-gray-100">
      <Sidebar open={open} setOpen={setOpen} />

      <div className="content flex flex-col flex-1">
        <Topbar setOpen={setOpen} />

        <div className="page flex-1 p-3 sm:p-4 md:p-6 overflow-y-auto">
          <Outlet />
        </div>
      </div>
    </div>
  )
}