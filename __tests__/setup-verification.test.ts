describe('Test Setup Verification', () => {
  it('should run basic tests', () => {
    expect(1 + 1).toBe(2)
  })

  it('should handle string operations', () => {
    expect('hello'.toUpperCase()).toBe('HELLO')
  })

  it('should work with objects', () => {
    const testObj = { name: 'Test', value: 42 }
    expect(testObj.name).toBe('Test')
    expect(testObj.value).toBe(42)
  })

  it('should handle async operations', async () => {
    const result = await Promise.resolve('async test')
    expect(result).toBe('async test')
  })

  it('should work with mocks', () => {
    const mockFn = jest.fn()
    mockFn('test')
    expect(mockFn).toHaveBeenCalledWith('test')
  })
})