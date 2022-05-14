export type FunctionRequest<TRequestData = any> = {
  func: string,
  data: TRequestData,
}

export type WorkerFunctionClient<TRequestData = any, TResponseData = any>
  = (data: TRequestData) => Promise<TResponseData>
