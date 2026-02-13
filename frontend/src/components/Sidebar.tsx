import { Link } from "react-router-dom"
import { useAuth } from "../context/AuthContext";

interface SidebarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  roles?: string[]
}

export default function Sidebar({ open, setOpen }: SidebarProps) {
  const { user, loading } = useAuth()

  if (loading || !user) return null

  const adminLinks = [
    ["Dashboard", "/dashboard"],
    ["Create Cashier", "/create-cashier"],
    ["Update Credentials", "/update-credentials"],
    ["Warehouse", "/warehouse"],
    ["Store", "/store"],
    ["Transferred Goods History", "/transfer-history"],
    ["Debtors", "/debtors"],
    ["Sales", "/sales"],
    ["POS", "/pos"],
    ["External Invoice", "/external-invoice"],
    ["Stocks", "/stocks"],
  ]

  const clientLinks = [
    ["POS", "/pos"],
    ["External Invoice", "/external-invoice"],
  ]

  return (
    <>
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-black/30 z-40 md:hidden"
        />
      )}

      <aside
        className={`
          fixed md:static top-0 left-0 h-full w-64
          bg-[#f5f1ec] border-r border-[#e5ddd5]
          p-6 z-50
          transform transition-transform duration-300 ease-in-out
          ${open ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
        `}
      >
        <h2 className="text-xl font-bold mb-6 text-[#3e2f25]">
          Business Accounting Software
        </h2>

        <nav className="flex flex-col gap-2 text-sm">
          {/* Admin only */}
          {user.role === "SUPERADMIN" &&
            adminLinks.map(([label, path]) => (
              <Link
                key={path}
                to={path}
                onClick={() => setOpen(false)}
                className="px-3 py-2 rounded-md text-[#3e2f25] hover:bg-[#e5ddd5] hover:text-[#6f4e37] transition"
              >
                {label}
              </Link>
            ))}

          {/* Client only */}
          {user.role === "CLIENT" &&
            clientLinks.map(([label, path]) => (
              <Link
                key={path}
                to={path}
                onClick={() => setOpen(false)}
                className="px-3 py-2 rounded-md text-[#3e2f25] hover:bg-[#e5ddd5] hover:text-[#6f4e37] transition"
              >
                {label}
              </Link>
            ))}
        </nav>
      </aside>
    </>
  )
}