def success_response(data=None, message="Success", count=None):
    response = {
        "success": True,
        "message": message,
        "data": data
    }
    if count is not None:
        response["count"] = count
    return response

def error_response(message="Error", code=400):
    return {
        "success": False,
        "error": message,
        "code": code
    }
