import React from "react";
import { Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import UsersList from "./Redux/UserList";

const Home = () => {
  const navigate = useNavigate();
  return (
    <div>
      <div className="container">
        <h1 className="text-center my-4">
          Sri LaxmiNarsimha Fertilizers & Pesticides
        </h1>
        <div style={{ display: "flex", justifyContent: "space-evenly" }}>
          <Button
            onClick={() => {
              navigate("./pesticides-invoice", { state: "Pesticides" });
            }}
          >
            Pesticides
          </Button>
          <Button
            onClick={() => {
              navigate("./fertilizer-invoice", { state: "Fertilizers" });
            }}
          >
            Fertilizers
          </Button>
          <Button
            onClick={() => {
              navigate("./seed-invoice", { state: "Seed" });
            }}
          >
            Seed
          </Button>
        </div>
        {/* <UsersList/> */}
      </div>
    </div>
  );
};

export default Home;
