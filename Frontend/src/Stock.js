import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";

// Define a component to handle the stock table
const StockTable = () => {
  const [data, setData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formValues, setFormValues] = useState({
    productname: "",
    subproductname: "",
    quantity: "",
  });
  const [currentProduct, setCurrentProduct] = useState(null);
  const [currentSubproduct, setCurrentSubproduct] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("http://localhost:8000/stock"); // Update the endpoint as needed
        setData(response.data);
      } catch (error) {
        console.error("Error fetching stock data:", error);
      }
    };

    fetchData();
  }, []);

  const handleEdit = (product, subproduct) => {
    setCurrentProduct(product);
    setCurrentSubproduct(subproduct);
    setFormValues({
      productname: product,
      subproductname: subproduct.name,
      quantity: subproduct.quantity,
    });
    setIsEditing(true);
    setShowModal(true);
  };

  const handleAddStock = () => {
    setCurrentProduct(null);
    setCurrentSubproduct(null);
    setFormValues({
      productname: "",
      subproductname: "",
      quantity: "",
    });
    setIsEditing(false);
    setShowModal(true);
  };

  const handleClose = () => {
    setShowModal(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await axios.put(
          `http://localhost:8000/editstock/${currentProduct}/${currentSubproduct.name}/${currentSubproduct._id}`,
          {
            subproductname: formValues.subproductname,
            quantity: formValues.quantity,
          }
        );
      } else {
        await axios.post("http://localhost:8000/stock", formValues); 
      }
      handleClose();
      const response = await axios.get("http://localhost:8000/stock"); 
      setData(response.data);
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDelete = async (product, subproductId) => {
    debugger;
    try {
      await axios.delete(
        `http://localhost:8000/stock/${product}/subproduct/${subproductId}`
      );
      const response = await axios.get("http://localhost:8000/stock");
      setData(response.data);
    } catch (error) {
      console.error("Error deleting subproduct:", error);
    }
  };

  return (
    <div className="container mt-4">
      <h1 className="mb-4">Stock Inventory</h1>
      <Button variant="primary" onClick={handleAddStock} className="mb-3">
        Add Stock
      </Button>
      <table className="table table-striped table-bordered">
        <thead>
          <tr>
            <th>S.No</th>
            <th>Product Category</th>
            <th>Subproduct Name</th>
            <th>Quantity</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.map((category, categoryIndex) => (
            <React.Fragment key={categoryIndex}>
              {/* Product category header */}
              {category.subproducts.length > 0 && (
                <tr className="category-header">
                  <td colSpan="6" className="bg-light font-weight-bold">
                    {category.productname}
                  </td>
                </tr>
              )}
              {/* Subproducts */}
              {category.subproducts.map((subproduct, subIndex) => (
                <tr key={subIndex}>
                  <td>
                    {categoryIndex + 1}.{subIndex + 1}
                  </td>{" "}
                  {/* Serial number */}
                  <td></td> {/* Empty cell for category column */}
                  <td>{subproduct.name}</td>
                  <td>{subproduct.quantity}</td>
                  <td>
                    {new Date(subproduct.date).toLocaleDateString()}{" "}
                    {new Date(subproduct.date).toLocaleTimeString()}
                  </td>
                  <td>
                    <Button
                      variant="primary"
                      onClick={() =>
                        handleEdit(category.productname, subproduct)
                      }
                      style={{ marginRight: "5px" }}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() =>
                        handleDelete(category.productname, subproduct._id)
                      }
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </React.Fragment>
          ))}
        </tbody>
      </table>

      {/* Modal for Add/Edit Stock */}
      <Modal show={showModal} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>{isEditing ? "Edit Stock" : "Add Stock"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="productname">
              <Form.Label>Product Name</Form.Label>
              <Form.Control
                type="text"
                name="productname"
                value={formValues.productname}
                onChange={handleChange}
                disabled={isEditing} // Disable if editing
              />
            </Form.Group>
            <Form.Group controlId="subproductname">
              <Form.Label>Subproduct Name</Form.Label>
              <Form.Control
                type="text"
                name="subproductname"
                value={formValues.subproductname}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Form.Group controlId="quantity">
              <Form.Label>Quantity</Form.Label>
              <Form.Control
                type="number"
                name="quantity"
                value={formValues.quantity}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Button className="mt-2" variant="primary" type="submit">
              {isEditing ? "Update" : "Submit"}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default StockTable;
