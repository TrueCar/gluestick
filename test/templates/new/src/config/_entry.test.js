import React from "react";
import { stub, spy } from "sinon";
import { Route } from "react-router";
import { expect } from "chai";
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
    getRoutes = stub().returns(ROUTES);
    getStore = stub().returns(store);
    history = HISTORY;
    match = spy();
    props = {
      getRoutes,
      store: STORE
    };
  });

  it("render without issues", () => {
    const subject = <Entry {...props} />;
    const wrapper = shallow(subject);
    expect(wrapper).to.exist;
  });

  it("should build a store and the proper routes when calling Entry.start", () => {
    Entry.start(getRoutes, getStore, match, history);
    expect(getRoutes.calledWith(getStore())).to.equal(true);
  });
});

