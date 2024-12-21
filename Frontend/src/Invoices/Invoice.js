import React, { useState, useEffect } from "react";
import Table from "react-bootstrap/Table";
import Button from "react-bootstrap/Button";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";
import { format } from "date-fns";
import { useLocation } from "react-router-dom";
import { Toast, ToastContainer } from "react-bootstrap";

const Invoice = () => {
  const { state } = useLocation();
  const [customerName, setCustomerName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [rows, setRows] = useState([
    {
      productName: "",
      gstPer: "",
      quantity: "",
      price: "",
      taxableAmount: "",
      cgst: "",
      sgst: "",
      totalAmount: "",
    },
  ]);
  const [totalTaxableAmount, setTotalTaxableAmount] = useState(0);
  const [totalCgst, setTotalCgst] = useState(0);
  const [totalSgst, setTotalSgst] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [totalQty, setTotalQty] = useState(0);
  const [cancelledRows, setCancelledRows] = useState([]);
  const [invoice, setInvoice] = useState(1);
  const date = new Date();
  const formattedDate = format(date, "dd/MM/yyyy");
  const [show, setShow] = useState(false);
  const [showMessage,setShowMessage] = useState("")

  const getInvoiceData = async () => {
    // debugger
    let apiUrl;
    if (state === "Pesticides") {
      apiUrl = "http://localhost:8000/pescidesinvoicedata";
    }
    if (state === "Fertilizers") {
      apiUrl = "http://localhost:8000/fertilizerinvoicedata";
    }
    if (state === "Seed") {
      apiUrl = "http://localhost:8000/seedsinvoiceedata";
    }

    try {
      const response = await axios.get(apiUrl);
      const data = response.data;
      const lastInvoice = data[data.length - 1].invoice;
      setInvoice(parseInt(lastInvoice) + 1);
    } catch (error) {
      console.log(error, "Error while fetching");
    }
  };

  useEffect(() => {
    getInvoiceData();
  }, []);

  useEffect(() => {
    calculateTotals();
  }, [rows, cancelledRows]);

  const handleInputChange = (index, event) => {
    const { name, value } = event.target;
    const newRows = [...rows];
    newRows[index][name] = value;
    setRows(newRows);
  };

  const calculateRowAmounts = (index) => {
    const newRows = [...rows];
    const { gstPer, quantity, price } = newRows[index];
    const gst = parseFloat(gstPer) || 0;
    const qty = parseFloat(quantity) || 0;
    const unitPrice = parseFloat(price) || 0;

    const amount = unitPrice * qty;
    const calculatedCgst = (amount * (gst / 100)) / 2;
    const calculatedSgst = (amount * (gst / 100)) / 2;
    const calculatedTaxble = amount - (calculatedCgst + calculatedSgst);

    newRows[index].taxableAmount = calculatedTaxble.toFixed(2);
    newRows[index].cgst = calculatedCgst.toFixed(2);
    newRows[index].sgst = calculatedSgst.toFixed(2);
    newRows[index].totalAmount = amount.toFixed(2);

    setRows(newRows);
  };

  const addRow = () => {
    setRows([
      ...rows,
      {
        productName: "",
        gstPer: "",
        quantity: "",
        price: "",
        taxableAmount: "",
        cgst: "",
        sgst: "",
        totalAmount: "",
      },
    ]);
  };

  const handleCancel = (index) => {
    const cancelledRow = rows[index];
    const updatedCancelledRows = [...cancelledRows, cancelledRow];
    setCancelledRows(updatedCancelledRows);
    console.log(rows.filter((item, rowIndex) => console.log(index, rowIndex)));
    const remainingRows = rows.filter((item, rowIndex) => rowIndex !== index);
    setRows(remainingRows);
  };

  const calculateTotals = () => {
    const totals = rows.reduce(
      (acc, row) => {
        const taxableAmount = parseFloat(row.taxableAmount) || 0;
        const cgst = parseFloat(row.cgst) || 0;
        const sgst = parseFloat(row.sgst) || 0;
        const totalAmount = parseFloat(row.totalAmount) || 0;
        const totalQantity = parseFloat(row.quantity) || 0;

        return {
          taxableAmount: acc.taxableAmount + taxableAmount,
          cgst: acc.cgst + cgst,
          sgst: acc.sgst + sgst,
          totalAmount: acc.totalAmount + totalAmount,
          totalQantity: acc.totalQantity + totalQantity,
        };
      },
      { taxableAmount: 0, cgst: 0, sgst: 0, totalAmount: 0, totalQantity: 0 }
    );

    setTotalTaxableAmount(totals.taxableAmount.toFixed(2));
    setTotalCgst(totals.cgst.toFixed(2));
    setTotalSgst(totals.sgst.toFixed(2));
    setTotalAmount(totals.totalAmount.toFixed(2));
    setTotalQty(totals.totalQantity);
  };

  const handleSubmit = async (event) => {
    debugger
    event.preventDefault();
    const formData = {
      customerName,
      phoneNumber,
      invoice,
      date,
      products: rows.filter((row) => !cancelledRows.includes(row)),
      totalAmount,
      totalTaxableAmount,
      totalCgst,
      totalSgst,
      totalQty,
    };

    let apiUrl;
    if (state === "Pesticides") {
      apiUrl = "http://localhost:8000/pesticidesinvoice";
    }
    if (state === "Fertilizers") {
      apiUrl = "http://localhost:8000/fertilizerinvoice";
    }
    if (state === "Seed") {
      apiUrl = "http://localhost:8000/seedsinvoice";
    }

    try {
      const response = await axios.post(apiUrl, formData);
      setShow(true)
      setShowMessage(response.data.message);
      await getInvoiceData();
    } catch (error) {
      console.error("Error:", error.response.data.message);
      setShow(true)
      setShowMessage(error.response?.data?.message);
    }
    setCustomerName("");
    setPhoneNumber("");
    setRows([
      {
        productName: "",
        gstPer: "",
        quantity: "",
        price: "",
        taxableAmount: "",
        cgst: "",
        sgst: "",
        totalAmount: "",
      },
    ]);
  };

  return (
    <div className="container">
         <ToastContainer position="top-end" className="p-3 mt-5">
      <Toast show={show} onClose={()=>setShow(false)} bg="primary" delay={3000} autohide>
        <Toast.Header>
          <strong className="me-auto">Message</strong>
        </Toast.Header>
        <Toast.Body style={{color:"white"}}>{showMessage}</Toast.Body>
      </Toast>
    </ToastContainer>
        <Button onClick={() => setShow(true)}>Show Toast</Button>
      <h1 className="text-center my-4">
        Sri LaxmiNarsimha Fertilizers & Pesticides
      </h1>
      <form onSubmit={handleSubmit}>
        <h6 style={{ display: "flex", justifyContent: "right" }}>
          Date:{formattedDate}
        </h6>
        <div className="form-group">
          <label>Customer Name:</label>
          <input
            type="text"
            className="form-control"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Phone No:</label>
          <input
            type="number"
            className="form-control"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            required
            maxLength={10}
          />
        </div>
        <h5 className="form-group">InvoiceNumber:{invoice}</h5>
        <Button
          variant="primary"
          onClick={addRow}
          type="button"
          className="mt-3"
        >
          Add Product
        </Button>
        <Table striped bordered hover className="mt-4">
          <thead>
            <tr>
              <th>Serial No.</th>
              <th>Product Name</th>
              <th>GST (%)</th>
              <th>Quantity</th>
              <th>Price</th>
              <th>Total Amount</th>
              <th>CGST</th>
              <th>SGST</th>
              <th>Taxable Amount</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>
                  <input
                    type="text"
                    name="productName"
                    value={row.productName}
                    onChange={(e) => handleInputChange(index, e)}
                    className="form-control"
                    required
                  />
                </td>
                <td>
                  <input
                    type="text"
                    name="gstPer"
                    value={row.gstPer}
                    onChange={(e) => handleInputChange(index, e)}
                    onBlur={() => calculateRowAmounts(index)}
                    className="form-control"
                    required
                  />
                </td>
                <td>
                  <input
                    type="text"
                    name="quantity"
                    value={row.quantity}
                    onChange={(e) => handleInputChange(index, e)}
                    onBlur={() => calculateRowAmounts(index)}
                    className="form-control"
                    required
                  />
                </td>
                <td>
                  <input
                    type="text"
                    name="price"
                    value={row.price}
                    onChange={(e) => handleInputChange(index, e)}
                    onBlur={() => calculateRowAmounts(index)}
                    className="form-control"
                    required
                  />
                </td>
                <td>
                  <input
                    type="text"
                    name="totalAmount"
                    value={row.totalAmount}
                    readOnly
                    className="form-control"
                  />
                </td>
                <td>
                  <input
                    type="text"
                    name="cgst"
                    value={row.cgst}
                    readOnly
                    className="form-control"
                  />
                </td>
                <td>
                  <input
                    type="text"
                    name="sgst"
                    value={row.sgst}
                    readOnly
                    className="form-control"
                  />
                </td>
                <td>
                  <input
                    type="text"
                    name="taxableAmount"
                    value={row.taxableAmount}
                    readOnly
                    className="form-control"
                  />
                </td>
                <td>
                  {rows.length > 1 && (
                    <Button
                      variant="danger"
                      onClick={() => handleCancel(index)}
                    >
                      Cancel
                    </Button>
                  )}
                </td>
              </tr>
            ))}
            <tr>
              <td colSpan="3">Total</td>
              <td>
                <input
                  type="text"
                  value={totalQty}
                  readOnly
                  className="form-control"
                />
              </td>
              <td></td>
              <td>
                <input
                  type="text"
                  value={totalAmount}
                  readOnly
                  className="form-control"
                />
              </td>
              <td>
                <input
                  type="text"
                  value={totalCgst}
                  readOnly
                  className="form-control"
                />
              </td>
              <td>
                <input
                  type="text"
                  value={totalSgst}
                  readOnly
                  className="form-control"
                />
              </td>
              <td>
                <input
                  type="text"
                  value={totalTaxableAmount}
                  readOnly
                  className="form-control"
                />
              </td>
              <td></td>
            </tr>
          </tbody>
        </Table>
        <Button variant="success" type="submit" className="mt-3 ml-3">
          Submit
        </Button>
      </form>
    </div>
  );
};

export default Invoice;
