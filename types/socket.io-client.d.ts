declare module 'socket.io-client' {
  interface Socket {
    on(event: string, callback: (...args: any[]) => void): Socket;
    emit(event: string, ...args: any[]): Socket;
    disconnect(): Socket;
    connect(): Socket;
  }
  
  function io(url?: string, options?: any): Socket;
  export default io;
}
