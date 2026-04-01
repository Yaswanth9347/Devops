def get_runtime_image(runtime: str) -> str:
    runtimes = {
        "nginx": "nginx",
        "python": "python:3.11",
        "node": "node:18",
        "static": "nginx",
    }
    return runtimes.get(runtime, "nginx")
