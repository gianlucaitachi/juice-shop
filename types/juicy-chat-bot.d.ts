declare module 'juicy-chat-bot' {
  export interface BotTraining {
    state: boolean
  }

  export interface BotFactory {
    run(command: string): string | boolean
  }

  export interface BotResponse {
    action?: string
    handler?: string
    body?: string
  }

  export class Bot {
    constructor(name: string, greeting: string, trainingData: string, defaultResponse: string)
    training: BotTraining
    factory: BotFactory
    train(): Promise<void>
    greet(userId: string): string
    addUser(userId: string, name: string): void
    respond(query: string, userId: string): Promise<BotResponse>
  }

  const BotConstructor: typeof Bot
  export default BotConstructor
}
