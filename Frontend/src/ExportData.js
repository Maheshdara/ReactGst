

import axios from "axios";
import { Button } from "react-bootstrap";
import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";

const SeedsHistory = () => {
  const [data, setData] = useState([]);
  const [data2, setData2] = useState([]);
  const [data3, setData3] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);


  const fetchData = async () => {
    try {
      const response = await axios.get("http://localhost:8000/seedsinvoiceedata");
      setData(response.data);
    } catch (error) {
      console.log(error, "Error while fetching seeds data");
    }
  };

  const fetchData2 = async () => {
    try {
      const response = await axios.get("http://localhost:8000/pescidesinvoicedata");
      setData2(response.data);
    } catch (error) {
      console.log(error, "Error while fetching pesticides data");
    }
  };

  const fetchData3 = async () => {
    try {
      const response = await axios.get("http://localhost:8000/fertilizerinvoicedata");
      setData3(response.data);
    } catch (error) {
      console.log(error, "Error while fetching fertilizers data");
    }
  };

  useEffect(() => {
    fetchData();
    fetchData2();
    fetchData3();
  }, []);

  const filterDataByDateRange = (data) => {
    return data.filter((item) => {
      const invoiceDate = new Date(item.date);
      return (
        (!startDate || invoiceDate >= startDate) &&
        (!endDate || invoiceDate <= endDate)
      );
    });
  };

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
    debugger
    const summary = {
      sNo: 0,
      Date: "",
      billNo: "",
      products: new Set(),
      gst: new Set(),
      quentity:"",
      totalCgst: 0,
      totalSgst: 0,
      totalTaxableAmount: 0,
      totalAmount: 0,
    };

    invoices.sort((a, b) => a.invoice - b.invoice);
    let billNumbers = [];

    invoices.forEach((invoice, index) => {
      summary.sNo = index + 1;
      summary.Date = new Date(invoice.date).toLocaleDateString();
      summary.products = new Set([
        ...summary.products,
        ...invoice.products.map((p) => p.productName),
      ]);
      summary.gst = new Set([
        ...summary.gst,
        ...invoice.products.map((p) => `${p.gstPer}%`),
      ]);
      summary.quentity = new Set([
        ...summary.quentity,
        ...invoice.products.map((p)=> (p.quantity))
      ])
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

    summary.billNo = billfor.toString();
    summary.products = Array.from(summary.products).join(", ");
    summary.gst = Array.from(summary.gst).join(", ");
    summary.quentity = Array.from(summary.quentity).join(", ");
    return summary;
  };

  const createExcelSheet = (data, sheetName) => {
    const currentMonthData = filterDataByDateRange(data);

    if (currentMonthData.length === 0) {
      alert(`No data available for ${sheetName} in the specified date range.`);
      return null;
    }

    const groupedData = groupDataByDate(currentMonthData);
    const summaries = Object.keys(groupedData).flatMap((date, index) => {
      const invoiceSummaries = aggregateInvoiceData(groupedData[date]);
      invoiceSummaries.sNo = index + 1;
      return invoiceSummaries;
    });

    const ws = XLSX.utils.json_to_sheet(summaries);
    return { ws, sheetName };
  };

  const exportData = () => {
    const pesticidesSheet = createExcelSheet(data2, "Pesticides");
    const fertilizersSheet = createExcelSheet(data3, "Fertilizers");
    const seedsSheet = createExcelSheet(data, "Seeds");

    if (!pesticidesSheet && !fertilizersSheet && !seedsSheet) {
      alert("No data available for the specified date range.");
      return;
    }

    const wb = XLSX.utils.book_new();
    if (pesticidesSheet) XLSX.utils.book_append_sheet(wb, pesticidesSheet.ws, pesticidesSheet.sheetName);
    if (fertilizersSheet) XLSX.utils.book_append_sheet(wb, fertilizersSheet.ws, fertilizersSheet.sheetName);
    if (seedsSheet) XLSX.utils.book_append_sheet(wb, seedsSheet.ws, seedsSheet.sheetName);

    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "binary" });
    const blob = new Blob([s2ab(wbout)], { type: "application/octet-stream" });
    saveAs(blob, `Invoice_Summary_${format(startDate, 'yyyy-MM-dd')}_to_${format(endDate, 'yyyy-MM-dd')}.xlsx`);
  };

  const s2ab = (s) => {
    const buf = new ArrayBuffer(s.length);
    const view = new Uint8Array(buf);
    for (let i = 0; i < s.length; i++) {
      view[i] = s.charCodeAt(i) & 0xff;
    }
    return buf;
  };

  

  return (
    <div className="container">
     
      <div className="mt-2 ml-2" style={{display:"flex",justifyContent:"space-around",width:"500px"}}>
        <div>
        <label>Start Date: </label>
        <DatePicker
          selected={startDate}
          onChange={(date) => setStartDate(date)}
          dateFormat="yyyy-MM-dd"
          isClearable
        />
        </div>
        <div>
        <label>End Date: </label>
        <DatePicker
          selected={endDate}
          onChange={(date) => setEndDate(date)}
          dateFormat="yyyy-MM-dd"
          isClearable
        />
        </div>
      </div>
      <Button className="mt-5 ml-2" variant="primary" onClick={exportData}>
        Export Data
      </Button>
    </div>
  );
};

export default SeedsHistory;

               


