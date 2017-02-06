import React from "react";
import { Route } from "react-router";
import { shallow } from "enzyme";
import { getHttpClient } from "gluestick-shared";

import Entry from "../.entry";

const httpClient = getHttpClient();
const STORE = {};
const HISTORY = {};
const ROUTES = (
  <Route path="/">
    <Route path="test" />
  </Route>
);

describe("templates/new/src/config/.entry", () => {
  let props;
  let getRoutes;
  let getStore;
  let match;
  let history;
  let store;

  beforeEach(() => {
    store = STORE;
    getRoutes = jest.fn().mockImplementation(() => ROUTES);
    getStore = jest.fn().mockImplementation(() => store);
    history = HISTORY;
    match = jest.fn();
    props = {
      getRoutes,
      store: STORE,
    };
  });

  it("render without issues", () => {
    const subject = <Entry {...props} />;
    const wrapper = shallow(subject);
    expect(wrapper).toBeDefined();
  });

  it("should build a store and the proper routes when calling Entry.start", () => {
    Entry.start(getRoutes, getStore, match, history);
    expect(getRoutes).toBeCalledWith(getStore(), httpClient);
  });
});
