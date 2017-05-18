/* @flow */
import type { CreateTemplate } from '../types';

module.exports = (createTemplate: CreateTemplate) => createTemplate`
.Home-header {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 4rem 1rem;
  color: white;
  background-color: #222;
}

.Home-box {
  width: 100%;
  margin: 0 0.5rem;
  padding: 1rem;
  background-color: #F5F5F5;
}

.Home-row {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin-top: 1rem;
}

@media (max-width: 40rem) {
  .Home-box {
    text-align: center;
    margin-bottom: 0.5rem;
  }
  .Home-row {
    flex-wrap: wrap;
  }
}
`;
