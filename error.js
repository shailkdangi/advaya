exports.createError = (status , message) =>{
    const err = new Error();
    err.status = status;
    err.success = false;
    err.message =message;
    return err
}