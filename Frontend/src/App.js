// App.js
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./Home";
import LoginPage from "./Loginpage";
import History from "./History";
import { AuthProvider, useAuth } from './Auth';
import 'bootstrap/dist/css/bootstrap.min.css';
import Stock from './Stock';
import ExportData from "./ExportData";
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import Invoice from "./Invoices/Invoice";
import InvoiceHistory from "./History/InvoiceHistory";
import ViewInvoice from "./ViewInvoice/ViewInvoice";
import { Link } from "react-router-dom";


function App() {
  const { isLoggedIn } = useAuth();


  return (
    <div>
       <Navbar expand="lg" className="bg-body-tertiary">
      <Container>
        <Navbar.Brand href="#home">React-Bootstrap</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link href="/">Home</Nav.Link>
            // <Nav.Link href="/stock">Stock</Nav.Link>
<Nav.Link as={Link} to="/stock">Stock</Nav.Link>
            <NavDropdown title="History" id="basic-nav-dropdown">
              <NavDropdown.Item href="/pesticides-invoice-history" >Pesticides History</NavDropdown.Item>
              <NavDropdown.Item href="/fertilizer-invoice-history">
              Fertilizers History
              </NavDropdown.Item>
              <NavDropdown.Item href="/seed-invoice-history">Seed History</NavDropdown.Item>
            </NavDropdown>
            <Nav.Link href="/gstdata">Exportgst</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  
      
      <BrowserRouter>
        <Routes>
          {/* <Route path="/" element={isLoggedIn ? <Home /> : <Navigate to="/loginpage" />} /> */}
          <Route path="/" element={ <Home />} />
          <Route path="/pesticides-invoice-history" element={ <InvoiceHistory /> } />
          <Route path="/fertilizer-invoice-history" element={ <InvoiceHistory /> } />
          <Route path="/seed-invoice-history" element={ <InvoiceHistory /> } />
          <Route path="/view-invoice/:customerName/:invoice" element={<ViewInvoice />} />
          <Route path="/gstdata" element={<ExportData/>} />
          <Route path="/pesticides-invoice" element={<Invoice />} />
          <Route path="/fertilizer-invoice" element={<Invoice />} />
          <Route path="/seed-invoice" element={<Invoice />} />
          <Route path="/stock" element={<Stock/>} />
          <Route path="/loginpage" element={<LoginPage />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default function WrappedApp() {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}




