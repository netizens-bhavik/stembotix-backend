export interface LiveStream {
    id: string
    title: string
    subscriptionPrice: number
    description: string
    thumbnail: string
    is_active:boolean,
    is_completed:boolean,
    startDate:Date,
    endDate:Date,
    link:string,
    categories:string,
  }