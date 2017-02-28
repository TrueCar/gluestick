/* @flow */
import type { CreateTemplate } from '../../types';

module.exports = (createTemplate: CreateTemplate) => createTemplate`
.Home-header {
  background-color: #222;
  height: 150px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  margin-bottom: 0.5rem;
}

.Home-box {
  background-color: #F5F5F5;
  padding: 1rem;
  margin: 0.5rem;
  width: 100%;
}

.Home-row {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}
`;
