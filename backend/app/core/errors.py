class DeploymentError(Exception):
    def __init__(self, message):
        self.message = message
        super().__init__(self.message)

class BuildError(Exception):
    pass

class GitError(Exception):
    pass

def error_response(message, code=400):
    return {
        "error": True,
        "message": message,
        "code": code
    }
