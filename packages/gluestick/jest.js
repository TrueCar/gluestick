/**
 * Always mock npmDependencies lib since we never want to really install dependencies while testing
 */
jest.mock('./src/lib/npmDependencies');
