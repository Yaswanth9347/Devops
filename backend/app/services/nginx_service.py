import os

NGINX_PATH = "/etc/nginx/sites-available/"

def create_config(deployment_id: int, port: int):
    config = f"""
server {{
    listen {8000 + deployment_id};
    location / {{
        proxy_pass http://localhost:{port};
    }}
}}
"""
    filename = f"devdeploy_{deployment_id}"
    tmp_path = f"/tmp/{filename}"
    target_path = NGINX_PATH + filename

    # Write to a temporary file we have access to
    with open(tmp_path, "w") as f:
        f.write(config)

    # Securely move and escalate via sudo
    os.system(f"sudo mv {tmp_path} {target_path}")
    os.system(f"sudo ln -sf {target_path} /etc/nginx/sites-enabled/")
    os.system("sudo nginx -t")
    os.system("sudo service nginx reload")
