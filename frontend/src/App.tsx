import { Routes, Route, Navigate } from 'react-router-dom'

// auth
import Login from './pages/auth/Login.tsx'


// layout
import Layout from './components/Layout'

// dashboard
import Dashboard from './pages/dashboard/Dashboard'

// warehouse
import AddWarehouse from './pages/warehouse/AddWarehouse'
import AddGoods from './pages/warehouse/AddGoods'
import ViewWarehouseStock from './pages/warehouse/ViewWarehouseStock'
import WarehouseGoods from './pages/warehouse/WarehouseGoods '

// store
import AddStore from './pages/store/AddStore'
import TransferGoods from './pages/store/TransferGoods'
import ViewStoreStock from './pages/store/ViewStoreStock'
import TransferHistory from './pages/store/TransferHistory'

// pos
import PosEntry from './pages/pos/PosEntry'
// import AddPosProduct from './pages/pos/AddPosProduct'

// debtors
import DebtorsList from "./pages/debtors/DebtorsList"
import AddCustomer from "./pages/debtors/AddCustomer"
import AddDebt from "./pages/debtors/AddDebt"
import DebtDetails from "./pages/debtors/DebtDetails"

import { Toaster } from "sonner"
import ProtectedRoute from './components/ProtectedRoute'
import CreateClient from './pages/auth/CreateClient'
import Receipt from './pages/pos/Receipt'
import CreateExternalInvoice from './pages/invoice/CreateExternalInvoice'
import ExternalInvoice from './pages/invoice/ExternalInvoice'
import ViewInvoice from './pages/invoice/ViewInvoice'
import ViewStoreProducts from './pages/store/ViewStoreProducts'
import ViewClients from './pages/auth/ViewClient.tsx'
import ChangePassword from './pages/auth/ChangePassword.tsx'
import { useEffect } from 'react'
import { initForegroundNotifications } from './lib/foreground.ts'
// import './lib/getFcmToken.ts'
import { useAuth } from './context/AuthContext.tsx'
import { areNotificationsEnabled, registerPush } from './lib/getFcmToken.ts'
import Sales from './pages/sales/Sales.tsx'
import { api } from './lib/api.ts'
import SalesPage from './pages/pos/SalesPage.tsx'
import Stocks from './pages/stocks/Stocks.tsx'


export default function App() {
  const { user } = useAuth()

  useEffect(() => {
    const wakeServer = async () => {
      try {
        const res = await api("/health")
        console.log(res.data)
      } catch (err) {
        console.error("Shit went sideways" + err)
      }
    }
    wakeServer()
  },[])

  useEffect(() => {
    // Initialize foreground notifications
    initForegroundNotifications()

    // Auto-register push if user is logged in
    if (user && !areNotificationsEnabled()) {
      // Optionally delay to not interrupt login flow
      setTimeout(() => {
        registerPush()
      }, 2000)
    }
  }, [user])

  return (
    <>
    {/* <Toaster
      position="top-center"
      toastOptions={{
        style: {
          background: "#f5f1ec",
          color: "#3e2f25",
          border: "1px solid #e5ddd5",
        },
      }}
    /> */}
    <Toaster position="top-center" richColors />

    <Routes>
      {/* public */}
      <Route path="/login" element={<Login />} />

      {/* protected */}
      <Route element={<ProtectedRoute roles={["SUPERADMIN"]} />}>

        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />

          <Route path="/update-credentials" element={<ChangePassword />} />

          <Route path="/create-cashier" element={<CreateClient />} />
          <Route path="/cashier" element={<ViewClients />} />

          {/* warehouse */}
          <Route path="/warehouse/add" element={<AddWarehouse />} />
          <Route path="/warehouse/add-goods" element={<AddGoods />} />
          <Route path="/warehouse" element={<ViewWarehouseStock />} />
          <Route path="/warehouse/:id/goods" element={<WarehouseGoods />} />

          {/* store */}
          <Route path="/store/add" element={<AddStore />} />
          <Route path="/store/transfer" element={<TransferGoods />} />
          <Route path="/store" element={<ViewStoreStock />} />
          <Route path="/store/:id" element={<ViewStoreProducts />} />
          <Route path="/transfer-history" element={<TransferHistory />} />

          {/* sales */}
          <Route path='sales' element={<Sales/>}/>

          {/* stocks */}
          <Route path='stocks' element={<Stocks/>}/>

          {/* debtors */}
          <Route path="/debtors" element={<DebtorsList />} />
          <Route path="/debtors/add" element={<AddCustomer />} />
          <Route path="/debtors/:customerId" element={<DebtDetails />} />
          <Route
            path="/debtors/add-debt/:customerId"
            element={<AddDebt />}
          />
        </Route>
      </Route>
      
      <Route element={<Layout/>}>
        {/* pos */}
        <Route path="/pos" element={<PosEntry />} />
        <Route path="/receipt/:saleId" element={<Receipt />} />
        <Route path="/receipt" element={<SalesPage />} />

        {/* External Invoice */}
        <Route path="/create/external-invoice" element={<CreateExternalInvoice />} />
        <Route path="/external-invoice/:id" element={<ExternalInvoice />} />
        <Route path="/external-invoice" element={<ViewInvoice />} />
      </Route>

      {/* fallback */}
      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
    </>
  )
}
