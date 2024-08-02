import React, { useState, useEffect } from "react";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

const PayPalButtonComponent = ({ amount }) => {
  const [orderID, setOrderID] = useState("");
  const [onApproveMessage, setOnApproveMessage] = useState("");
  const [onErrorMessage, setOnErrorMessage] = useState("");

  useEffect(() => {
    setOrderID("");
    setOnApproveMessage("");
    setOnErrorMessage("");
  }, [amount]);

  const createOrder = (data, actions) => {
    return actions.order.create({
      purchase_units: [
        {
          amount: {
            value: amount,
          },
        },
      ],
    }).then((orderID) => {
      setOrderID(orderID);
      return orderID;
    });
  };

  const onApprove = (data, actions) => {
    return actions.order.capture().then((details) => {
      setOnApproveMessage(`Transaction completed by ${details.payer.name.given_name}!`);
    });
  };

  const onError = (err) => {
    setOnErrorMessage(err.toString());
  };

  return (
    <div style={{ minHeight: "300px" }}>
      <table className="table" style={{ maxWidth: "400px" }}>
        <tbody>
          <tr>
            <th>Order ID:</th>
            <td>{orderID ? orderID : "unknown"}</td>
          </tr>
          <tr>
            <th>On Approve Message: </th>
            <td data-testid="message">{onApproveMessage}</td>
          </tr>
          <tr>
            <th>On Error Message: </th>
            <td data-testid="error">{onErrorMessage}</td>
          </tr>
        </tbody>
      </table>
      <PayPalScriptProvider options={{ "client-id": "test" }}>
        <PayPalButtons
          createOrder={createOrder}
          onApprove={onApprove}
          onError={onError}
        />
      </PayPalScriptProvider>
    </div>
  );
};

export default PayPalButtonComponent;
