import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import Table from "react-bootstrap/Table";
import "bootstrap/dist/css/bootstrap.min.css";
import { format } from "date-fns";

const ViewInvoice = () => {
  const location = useLocation();
  const { customerData } = location.state;

  console.log(customerData.customerName, "editdata");

  const [customerName, setCustomerName] = useState(customerData.customerName);
  const [phoneNumber, setPhoneNumber] = useState(customerData.phoneNumber);
  const [invoice, setInvoice] = useState(customerData.invoice);
  const formattedDate = format(customerData.date, "dd/MM/yyyy");

  const rows = 
    customerData.products.map((product) => ({
      productName: product.productName,
      gstPer: product.gstPer || "",
      quantity: product.quantity || "",
      price: product.price || "",
      taxableAmount: product.taxableAmount || "",
      cgst: product.cgst || "",
      sgst: product.sgst || "",
      totalAmount: product.totalAmount || "",
    }))

  const [totalTaxableAmount, setTotalTaxableAmount] = useState(customerData.totalTaxableAmount);
  const [totalCgst, setTotalCgst] = useState(customerData.totalCgst);
  const [totalSgst, setTotalSgst] = useState(customerData.totalSgst);
  const [totalAmount, setTotalAmount] = useState(customerData.totalAmount);
  const [totalQty, setTotalQty] = useState(customerData.totalQty);


  console.log(customerData, "datac");

  return (
    <div className="container">
      <h1 className="text-center my-4">
        Sri LaxmiNarsimha Fertilizers & Pesticides
      </h1>
      <form 
      >
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
            readOnly
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
            readOnly
          />
        </div>
        <h5 className="form-group">InvoiceNumber:{invoice}</h5>
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
                    className="form-control"
                    required
                    readOnly
                  />
                </td>
                <td>
                  <input
                    type="text"
                    name="gstPer"
                    value={row.gstPer}
                    className="form-control"
                    required
                    readOnly
                  />
                </td>
                <td>
                  <input
                    type="text"
                    name="quantity"
                    value={row.quantity}
                    className="form-control"
                    required
                    readOnly
                  />
                </td>
                <td>
                  <input
                    type="text"
                    name="price"
                    value={row.price}
                    className="form-control"
                    required
                    readOnly
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
              <td></td> {/* Empty cell for layout */}
            </tr>
          </tbody>
        </Table>
      </form>
    </div>
  );
};

export default ViewInvoice;
