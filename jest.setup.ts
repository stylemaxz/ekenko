import '@testing-library/jest-dom'
import { TextEncoder, TextDecoder } from 'util'

// Polyfill for TextEncoder/TextDecoder (needed for jose)
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder as any

// Polyfill for Request/Response (needed for Next.js API routes)
global.Request = class Request {
    constructor(public url: string, public init?: RequestInit) { }
    json() {
        return Promise.resolve(JSON.parse(this.init?.body as string || '{}'))
    }
} as any

global.Response = class Response {
    constructor(public body: any, public init?: ResponseInit) { }
    json() {
        return Promise.resolve(this.body)
    }
} as any
