DEPLOYMENT_STATES = [
    "pending",
    "cloning",
    "building",
    "deploying",
    "running",
    "failed",
    "stopped"
]

ALLOWED_TRANSITIONS = {
    "pending": ["cloning", "building", "failed"],
    "cloning": ["building", "failed"],
    "building": ["deploying", "failed", "running"],
    "deploying": ["running", "failed"],
    "running": ["stopped", "failed"],
    "failed": ["pending", "stopped"],
    "stopped": ["pending"]
}

def can_transition(current: str, new: str) -> bool:
    # If no state is set yet, any valid state can be the first state.
    if not current:
        return True
    allowed = ALLOWED_TRANSITIONS.get(current, [])
    return new in allowed

def update_status(deployment, new_status: str) -> bool:
    if can_transition(deployment.status, new_status):
        deployment.status = new_status
        return True
    return False
