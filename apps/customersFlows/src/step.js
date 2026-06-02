export class Step {
  constructor(ctx) {
    if (!ctx.customer) throw new Error('Customer is missing from the context')
    this.ctx = ctx
    this.data = ctx.data
    this.customer = ctx.customer
  }

  async run(input) {
    const error = await this.validate(input)
    if (error) throw new Error(error)
    
    const stepId = this.stepId
    const prompt = await this.prompt() 
    const data = await this.process(input)

    return { stepId, prompt, input, data }
  }
  
  async prompt() { throw new Error('Method prompt not implemented') }
  async validate(input) { throw new Error('Method validate not implemented') }
  async process(input) { throw new Error('Method process not implemented')
  }
}
