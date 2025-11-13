FROM timberio/vector:0.50.0-alpine

COPY vector.yaml /etc/vector/vector.yaml

WORKDIR /etc/vector

HEALTHCHECK --interval=30s --timeout=10s --retries=3 --start-period=10s \
    CMD ["vector", "validate", "/etc/vector/vector.yaml"]

CMD ["--config", "/etc/vector/vector.yaml"]