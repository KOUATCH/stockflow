"use client"

// Generic helper to call a Server Action from client code with proper typing.
export async function callAction<TVars, TData>(action: (input: TVars) => Promise<TData>, input: TVars): Promise<TData> {
  return action(input)
}
