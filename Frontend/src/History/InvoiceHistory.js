import axios from "axios";
import { Button } from "react-bootstrap";
import React, { useEffect, useRef, useState } from "react";
import Table from "react-bootstrap/Table";
import { useLocation, useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { format } from "date-fns";

const InvoiceHistory = () => {
  const [data, setData] = useState([]);
  const [search,setSearch] =  useState("");
  const [filterData,setFilterData] = useState();
  const page = useRef("")
  const location = useLocation(); 


  
  const navigate = useNavigate();

  const fetchData = async () => {
    debugger
    let apiUrl
    if(page.current === "pesticides-invoice-history"){
      apiUrl = "http://localhost:8000/pescidesinvoicedata"
    }
    if(page.current === "fertilizer-invoice-history"){
      apiUrl = "http://localhost:8000/fertilizerinvoicedata"
    }
    if(page.current === "seed-invoice-history"){
      apiUrl = "http://localhost:8000/seedsinvoiceedata"
    }
    try {
      const response = await axios.get(apiUrl);
      setData(response.data);
      console.log(response.data, "data");
    } catch (error) {
      console.log(error, "Error while fetching");
    }
  };

  const getData = (rowData) => {
    let apiUrl
    if(page.current === "pesticides-invoice-history"){
      apiUrl = "viewpesicides"
    }
    if(page.current === "fertilizer-invoice-history"){
      apiUrl = "viewfertilizer"
    }
    if(page.current === "seed-invoice-history"){
      apiUrl = "viewseed"
    }

    const customerData = rowData;
    navigate(`/view-invoice/${rowData.customerName}/${rowData.invoice}`, {
      state: {
        customerData,
      },
    });
  };


  useEffect(() => {
    page.current = location.pathname.split("/").filter(Boolean).pop();
    fetchData();
  }, []);


  const printInvoice = (rowData) => {
  const formattedDate = format(rowData.date, "dd/MM/yyyy");

    const content = `
      <html>
        <head>
          <title>Invoice</title>
          <style>
            body { font-family: Arial, sans-serif; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #dddddd; padding: 8px; }
            th { background-color: #f2f2f2; }
          </style>
        </head>
        <body>
          <h2>Invoice Details</h2>
           <h6 style={{ display: "flex", justifyContent: "right" }}>
          Date:${formattedDate}
        </h6>
        <div className="form-group">
          <label>Customer Name:</label>
         ${rowData.customerName}
        </div>
        <div className="form-group">
          <label>Phone No:</label>
          ${rowData.phoneNumber}
        </div>
        <h5 className="form-group">InvoiceNumber:${rowData.invoice}</h5>
          <table>
            <tr>
              <th>Product Name</th>
              <th>Quantity</th>
              <th>Total Amount</th>
            </tr>
            ${rowData.products
              .map(
                (product) => `
              <tr>
                <td>${product.productName}</td>
                <td>${product.quantity}</td>
                <td>${product.totalAmount}</td>
              </tr>
            `
              )
              .join("")}
          </table>
          <p>Total Amount: ${rowData.products
            .reduce((sum, product) => sum + parseFloat(product.totalAmount), 0)
            .toFixed(2)}</p>
          <script>window.print();</script>
        </body>
      </html>
    `;

    // Open new window with the invoice content for printing
    const printWindow = window.open("", "_blank");
    printWindow.document.open();
    printWindow.document.write(content);
    printWindow.document.close();
  };

  const handleSearch = () => {
    const filterValue =  data.filter((item) => {
      return item.customerName.toLowerCase().includes(search.toLowerCase());
    });
    console.log(filterValue, "filter");
    setFilterData(filterValue)
  }

  const handleonchange = (e) => {
    const newValue = e.target.value;
    setSearch(newValue);
    if (newValue.length == 0) {
        setFilterData(data);
    }
};

 

  return (
    <div>
      <input style={{margin:"25px"}}  type="search" value={search}  onChange={handleonchange}/> 
      <Button onClick={handleSearch}>Search</Button>
      <Table striped bordered hover size="sm">
        <thead>
          <tr>
          <th>S.No</th>
          <th>Date</th>
            <th>Customer Name</th>
            <th>Phone Number</th>
            <th>Products</th>
            <th>Total Amount</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {(filterData&&filterData.length>=1 ?filterData:data).map((item,index) => (
            <tr key={item._id}>
              <td>{item.invoice}</td>

              <td>{format(item.date,"dd/MM/yyyy")}</td>

              <td>{item.customerName}</td>
              <td>{item.phoneNumber}</td>
              <td>
                {item.products.map((product, idx) => (
                  <div key={idx}>
                    <span>
                      {product.productName} (Quantity: {product.quantity})
                    </span>
                    <br />
                  </div>
                ))}
              </td>
              <td>
                {item.products
                  .reduce(
                    (sum, product) => sum + parseFloat(product.totalAmount),
                    0
                  )
                  .toFixed(2)}
              </td>
              <td>
                <Button variant="primary" onClick={() => getData(item)}>
                  View Invoice
                </Button>
              </td>
              <td>
                <Button variant="primary" onClick={() => printInvoice(item)}>
                  Print
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default InvoiceHistory;
