const formatResponse = (statusCode: number, message: string, data: unknown) => {
    if (data) {
      return {
        statusCode,
        headers: { 'Content-Type': 'application/json' }, // <-- Add this
        body: JSON.stringify({
          message:message,
          data:data,
        }),
      };
    } else {
      return {
        statusCode,
        body: JSON.stringify({
          message:message,
          data:data,
        }),
      };
    }
  };
  
  export const SuccessResponse=(data:object)=>{
      return formatResponse(200,"success",data)
  }
  
  export const ErrorResponse=(code:number,error:unknown)=>{
      if(Array.isArray(error)){
          const errorObject=error[0].constraints
          const errorMessage=errorObject[Object.keys(errorObject)[0]] || "Error occurred"
          return formatResponse(code,errorMessage,errorMessage)
      }
      else{
          return formatResponse(code,`${error}`,error)
      }
  }

  // export const ErrorResponse=(code:number,error:unknown)=>{
  //   return {
  //     errorCode:code,
  //     errorMessage:error
  //   }
  // }
  