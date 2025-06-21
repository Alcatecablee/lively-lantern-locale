
declare global {
  function gtag(command: 'config' | 'event' | 'js', targetId: string, config?: any): void;
}

export {};
