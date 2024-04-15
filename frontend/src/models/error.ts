export interface ErrorMSG {
    status: number,
    data:{
        status:number,
        message:string,
        body:null,
    }
}

export const isErrorMsg = (obj: any): obj is ErrorMSG => {
    return obj 
    && 'status' in obj 
    && 'data' in obj
    && 'status' in obj.data
    && 'message' in obj.data
    && 'body' in obj.data
}