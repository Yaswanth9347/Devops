def parse_env_string(env_string: str) -> dict:
    env_dict = {}
    if not env_string:
        return env_dict
        
    pairs = env_string.split(",")
    for pair in pairs:
        if "=" in pair:
            key, value = pair.split("=", 1)
            env_dict[key.strip()] = value.strip()
            
    return env_dict
