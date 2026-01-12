declare module '@qalqul/sdk-call' {
  export class Calls {
    // Add any methods/properties as needed
  }
}

declare module '@qalqul/sdk-call/dist/model/QalqulSDK' {
  export class QalqulSDK {
    constructor(io: any, settings: any, callback: () => void);
    getCalls: () => Promise<any[]>;
    dial: (recipient: string) => Promise<string>;
    initialize: () => Promise<void>;
    logout: () => Promise<void>;
  }
}
