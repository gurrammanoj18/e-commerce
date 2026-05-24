import React from "react";
import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders storefront heading", async () => {
  render(<App />);
  expect(
    await screen.findByText(/build smarter workspaces with trusted electronics/i)
  ).toBeInTheDocument();
});
