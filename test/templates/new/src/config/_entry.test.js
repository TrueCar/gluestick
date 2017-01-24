import React from "react";
import { Route } from "react-router";
import { shallow } from "enzyme";

import Entry from "../../../../../templates/new/src/config/.entry";

const STORE = {};
const HISTORY = {};
const ROUTES = (
  <Route path="/">
    <Route path="test" />
  </Route>
);

describe("templates/new/src/config/.entry", () => {
  let props, getRoutes, getStore, match, history, store;

  beforeEach(() => {
    store = STORE;
    getRoutes = jest.fn().mockImplementation(() => ROUTES);
    getStore = jest.fn().mockImplementation(() => store);
    history = HISTORY;
    match = jest.fn();
    props = {
      getRoutes,
      store: STORE
    };
  });

  it("render without issues", () => {
    const subject = <Entry {...props} />;
    const wrapper = shallow(subject);
    expect(wrapper).toBeDefined();
  });

  it("should build a store and the proper routes when calling Entry.start", () => {
    Entry.start(getRoutes, getStore, match, history);
    expect(getRoutes).toBeCalledWith(getStore());
  });
});

