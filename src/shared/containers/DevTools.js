import React, { Component, PropTypes, Children } from "react";
//import { createDevTools } from "redux-devtools";
//import LogMonitor from "redux-devtools-log-monitor";
//import DockMonitor from "redux-devtools-dock-monitor";

function createDevTools (children) {
    const monitorElement = Children.only(children);
    const monitorProps = monitorElement.props;
    const Monitor = monitorElement.type;
    const ConnectedMonitor = connect(state => state)(Monitor);
    return class DevTools extends Component {
        static instrument = () => (state, action) => {
            console.log(state, action);
        };

        render () {
            return (
                <ConnectedMonitor {...monitorProps}></ConnectedMonitor>
            );
        }
    }
};

export default createDevTools(
    <div>Dev tools test</div>
);

//export default createDevTools(
    //<DockMonitor defaultIsVisible={true} toggleVisibilityKey="H" changePositionKey="Q">
        //<LogMonitor theme="solarized" />
    //</DockMonitor>
//);

