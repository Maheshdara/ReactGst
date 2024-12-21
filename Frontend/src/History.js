import axios from "axios";
import { Button } from "react-bootstrap";
import React, { useEffect, useState } from "react";
import Table from "react-bootstrap/Table";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { format } from "date-fns";

const History = () => {
  const [data, setData] = useState([]);
  const [search,setSearch] =  useState("");
  const [filterData,setFilterData] = useState();


  
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const response = await axios.get("http://localhost:8000/customersdata");
      setData(response.data);
      console.log(response.data, "data");
    } catch (error) {
      console.log(error, "Error while fetching");
    }
  };

  const getData = (rowData) => {
    const customerData = rowData;
    navigate(`/editcustomer/${rowData.customerName}/${rowData.invoice}`, {
      state: {
        customerData,
      },
    });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const groupDataByDate = (data) => {
    const groupedData = data.reduce((acc, item) => {
      const date = new Date(item.date).toLocaleDateString();
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(item);
      return acc;
    }, {});
    return groupedData;
  };

  const aggregateInvoiceData = (invoices) => {
    const summary = {
      sNo: 0,
      Date: "", // Initialize Date to empty string
      billNo: "",
      products: new Set(),
      gst: new Set(),
      totalCgst: 0,
      totalSgst: 0,
      totalTaxableAmount: 0,
      totalAmount: 0,
    };

    // Sort invoices by invoice number if they are not sorted
    invoices.sort((a, b) => a.invoice - b.invoice);
    invoices.sort((a, b) => console.log(a.invoice - b.invoice, "jk"));

    let billNumbers = [];

    invoices.forEach((invoice, index) => {
      summary.sNo = index + 1; // Set serial number (sNo)
      summary.Date = new Date(invoice.date).toLocaleDateString(); // Set Date to invoice date
      summary.products = new Set([
        ...summary.products,
        ...invoice.products.map((p) => p.productName),
      ]);
      summary.gst = new Set([
        ...summary.gst,
        ...invoice.products.map((p) => `${p.gstPer}%`),
      ]);
      summary.totalCgst += invoice.products.reduce(
        (sum, product) => sum + parseFloat(product.cgst),
        0
      );
      summary.totalSgst += invoice.products.reduce(
        (sum, product) => sum + parseFloat(product.sgst),
        0
      );
      summary.totalTaxableAmount += invoice.products.reduce(
        (sum, product) => sum + parseFloat(product.taxableAmount),
        0
      );
      summary.totalAmount += invoice.products.reduce(
        (sum, product) => sum + parseFloat(product.totalAmount),
        0
      );

      billNumbers.push(invoice.invoice);
    });

    let billNoRange = [];
    for (let i = 0; i < billNumbers.length; i++) {
      if (billNumbers.length > 1) {
        billNoRange.push(billNumbers[i]);
      } else {
        billNoRange.push(billNumbers[i]);
      }
    }

    let billfor = [];

    if (billNoRange.length === 1) {
      billfor.push(billNoRange[0]);
    } else {
      billfor.push(billNoRange[0] + "-" + billNoRange[billNoRange.length - 1]);
    }

    console.log(billfor, "billfor");

    console.log(billNoRange, "range");

    summary.billNo = billfor.toString();
    summary.products = Array.from(summary.products).join(", ");
    summary.gst = Array.from(summary.gst).join(", ");
    console.log(summary, "summary");
    return summary;
  };

  const exportData = () => {
    const currentMonthData = data.filter((item) => {
      const invoiceDate = new Date(item.date);
      const now = new Date();
      return (
        invoiceDate.getMonth() === now.getMonth() &&
        invoiceDate.getFullYear() === now.getFullYear()
      );
    });

    if (currentMonthData.length === 0) {
      alert("No data available for the current month.");
      return;
    }

    const groupedData = groupDataByDate(currentMonthData);
    console.log(groupedData, "group");
    const summaries = Object.keys(groupedData).flatMap((date, index) => {
      const invoiceSummaries = aggregateInvoiceData(groupedData[date]);
      invoiceSummaries.sNo = index + 1; // Set serial number for the group
      return invoiceSummaries;
    });

    console.log(summaries, "summaries");

    const ws = XLSX.utils.json_to_sheet(summaries);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Invoice Summary");

    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "binary" });
    const blob = new Blob([s2ab(wbout)], { type: "application/octet-stream" });
    saveAs(blob, `Invoice_Summary_${new Date().toLocaleDateString()}.xlsx`);
  };

  const s2ab = (s) => {
    const buf = new ArrayBuffer(s.length);
    const view = new Uint8Array(buf);
    for (let i = 0; i < s.length; i++) {
      view[i] = s.charCodeAt(i) & 0xff;
    }
    return buf;
  };

  const printInvoice = (rowData) => {
    // Construct HTML content for printing
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
            <th>Customer Name</th>
            <th>Phone Number</th>
            <th>Products</th>
            <th>Total Amount</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {(filterData&&filterData.length>=1 ?filterData:data).map((item) => (
            <tr key={item._id}>
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
                  Get Data
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
      <Button variant="primary" onClick={exportData}>
        Export Data
      </Button>
    </div>
  );
};

export default History;


// import React from 'react'
// import { Button } from 'react-bootstrap'

// const History = () => {
//   return (
//     <div className="container">
//       <h1 className="text-center my-4">
//         Sri LaxmiNarsimha Fertilizers & Pesticides
//       </h1>
//      <div style={{display:"flex", justifyContent:"space-evenly"}}>
//       <Button><a style={{color:"white",textDecoration:"none" }} href='./pesticides-invoice-history'>Pesticides</a></Button>
//       <Button><a style={{color:"white",textDecoration:"none" }} href='./fertilizer-invoice-history'>Fertilizers</a></Button>
//       <Button><a  style={{color:"white",textDecoration:"none" }} href='./seed-invoice-history'>Seed</a></Button>


//      </div>
//     </div>
//   )
// }

// export default History
