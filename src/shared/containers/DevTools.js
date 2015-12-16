import React, { Component, PropTypes } from "react";
import { createDevTools } from "redux-devtools";
import LogMonitor from "redux-devtools-log-monitor";
import DockMonitor from "redux-devtools-dock-monitor";

export default createDevTools(
    <DockMonitor defaultIsVisible={true} toggleVisibilityKey="H" changePositionKey="Q">
        <LogMonitor theme="solarized" />
    </DockMonitor>
);

