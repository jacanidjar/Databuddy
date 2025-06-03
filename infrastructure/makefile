SSH_PRIVATE_KEY=$$HOME/.ssh/id_rsa

install-dependencies:
	ansible-galaxy collection install ansible.posix
	ansible-galaxy collection install community.docker
	ansible-galaxy collection install community.general

setup-nodes: install-dependencies
	 ansible-galaxy collection install community.general
	 ansible-playbook --timeout 60 --ssh-common-args="-i $(SSH_PRIVATE_KEY) -o ServerAliveInterval=15" -i inventory.ini setup-nodes.yaml \
			-e "hosts_group=infra-nodes" 

init-swarm: install-dependencies
	 ansible-playbook --timeout 60 --ssh-common-args="-i $(SSH_PRIVATE_KEY) -o ServerAliveInterval=15" -i inventory.ini setup-swarm.yaml -e hosts_group=infra-nodes 

update-swarm: install-dependencies
	 ansible-playbook --timeout 60 --ssh-common-args="-i $(SSH_PRIVATE_KEY) -o ServerAliveInterval=15" -i inventory.ini add-swarm-nodes.yaml -e hosts_group=infra-nodes 

.PHONY: setup-nodes init-swarm update-swarm install-dependencies
