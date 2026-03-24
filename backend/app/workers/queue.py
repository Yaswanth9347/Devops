from redis import Redis
from rq import Queue

redis_conn = Redis(
    host="localhost",
    port=6379
)

deployment_queue = Queue(
    "deployments",
    connection=redis_conn
)
