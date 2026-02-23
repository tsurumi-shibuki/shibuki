const { greet } = require('./index');

test('greet returns welcome message', () => {
  expect(greet('Alice')).toBe('Welcome to Svaha Yoga School, Alice!');
});
