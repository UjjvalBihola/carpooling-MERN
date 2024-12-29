import { shallow } from "enzyme";
import React from "react";
import Login from "../Login";

describe("login", () => {
  const setToken = jest.fn();
  let wrapper;

  beforeEach(() => {
    wrapper = shallow(<Login setToken={setToken} />);
  });

  it("Should render login button", () => {
    const loginButton = wrapper.find(`[data-test='login-button']`);
    expect(loginButton.length).toBe(1);
  });

  it("Should log-in", () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({ token: "tokken" }),
      })
    );
    wrapper
      .find(`[data-test='email-form-control']`)
      .simulate("change", { target: { value: "foo@bar.com" } });
    wrapper
      .find(`[data-test='password-form-control']`)
      .simulate("change", { target: { value: "foobar" } });
    wrapper.find(`[data-test='login-button']`).simulate("click");
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});
