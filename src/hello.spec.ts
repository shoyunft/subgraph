// hello.spec.ts
import { hello } from './hello'

test('returns hello world', () => {
  expect(hello('world')).toBe("Hello world")
})