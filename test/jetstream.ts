import { connect, DeliverPolicy, RetentionPolicy, StorageType, StringCodec } from "nats";

async function main() {
  // Connect to NATS server
  console.log("Connecting to NATS");
  const nc = await connect({ servers: "http://clickhouse-jetstream.yxgn5g.easypanel.host" });
  console.log("Connected to NATS");

  // Create JetStream context
  const js = nc.jetstream();

  // Create JetStream management context (for streams, consumers)
  const jsm = await nc.jetstreamManager();

  // Create a stream named "EVENTS" with subject "events.*"
  try {
    await jsm.streams.add({
      name: "EVENTS",
      subjects: ["events.*"],
      retention: RetentionPolicy.Limits,
      storage: StorageType.File,
      max_msgs_per_subject: -1,
      max_bytes: 10485760, // 10MB
    });
    console.log("Stream EVENTS created");
  } catch (err) {
    if (err.message.includes("stream name already in use")) {
      console.log("Stream EVENTS already exists");
    } else {
      throw err;
    }
  }

  const sc = StringCodec();

  // Publish a message to the stream
  const pubAck = await js.publish("events.hello", sc.encode("Hello JetStream!"));
  console.log(`Published message to ${pubAck.stream} with sequence ${pubAck.seq}`);

  // Subscribe to messages on "events.>" (wildcard)
  const sub = await js.subscribe("events.>", {
    config: {
      deliver_policy: DeliverPolicy.New,
      durable_name: "events-consumer",
    }
  });
  (async () => {
    for await (const msg of sub) {
      console.log(`Received message [${msg.seq}]: ${sc.decode(msg.data)}`);
      msg.ack(); // Acknowledge message
    }
    console.log("Subscription closed");
  })();

  // Keep process alive for demo purposes (or use your app lifecycle)
  setTimeout(() => {
    sub.unsubscribe();
    nc.close();
  }, 5000);
}

main().catch(console.error);