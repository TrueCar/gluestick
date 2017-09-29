/* @flow */
import type { CreateTemplate } from '../../types';

module.exports = (createTemplate: CreateTemplate) => createTemplate`
/* @flow */

import MasterLayout from "./components/MasterLayout";
import HomeApp from "./containers/HomeApp";
import NoMatchApp from "./containers/NoMatchApp";

export default function getRoutes(/* store: Object, httpClient: Object */) {
  return [
    {
      component: MasterLayout,
      path: "/${args => args.index || ''}",
      routes: [
        {
          path: "/${args => args.index || ''}",
          exact: true,
          component: HomeApp
        },
        {
          path: "/${args => (args.index ? `${args.index}/` : '')}*",
          component: NoMatchApp,
        },
      ],
    },
  ];
}
`;
